<?php

// #22716 «Корректировка срока годности и серии»

/*
	type=93 - корректировка срока годности и серии
*/

class FMD_SETSERIES extends M2_SITE_CLASS_
{

function _get_rights()
{
	return array(
		'item_sea' => "all",

		'load'  => "all",
		'save'  => "all",

		'post'  => "all",
		'unpost'  => "all",
	);
}


function load($dep_id=0,$id=0,$inputDepNameValue=0)
{
	global $env, $db, $dbt, $dban, $site;
	/* if (isset($_POST['inputDepNameValue'])) {
    // Обрабатываем значение
    $inputValue = $_POST['inputDepNameValue'];
} else {
    // Устанавливаем значение по умолчанию или обрабатываем отсутствие значения
    $inputValue = '';
} */
		//$inputDepNameValue=strval($_REQUEST['inputDepNameValue']);
		//$env->logS($inputDepNameValue);
		if (!$dep_id) $dep_id=intval($_REQUEST['dep_id']);
		if (!$id) $id=intval($_REQUEST['id']);
	$lag=$_SESSION['local_agent_list'];
	// шапка
	$hd=array('fields'=>array(
			'CODE'=>array('type'=>"text"),
			'NAME'=>array('type'=>"text"),
			'RNLY'=>array('type'=>"int"),
			'TYP'=>array('type'=>"text"),
			'VAL'=>array('type'=>"text"), ),
		'data'=>array(), );
	$r=$db->db_query("
		select i.uid, i.dep_id, i.id, i.docno, i.dateof,
			i.comment, i.modifyed, u.name as uname,
			i.status, i.type_id, t.name as type_name,
			i.client_id, d.name as dep_name,
			i.ext_id1 as dog_id, i.ext_id2 as supl_type
		from st_operations i
			left join fr_departments d on
				d.agent_id in ($lag) and d.dep_id=i.dep_id
			left join st_operationtypes t on t.id=i.type_id
			left join cm_users u on u.id=i.user_id
		 where
			 i.dep_id=$dep_id and i.id=$id");
	if (sizeof($r['data'])<1) {
		if ($id) throw new Exception("Документ #$dep_id/$id не найден!");
		// новый документ
		$type_id=intval($_REQUEST['type_id']);
			$hd=array(); foreach($r['fields'] as $k=>$v) $hd[$k]='';
		$hd['isLocalDoc']=strstr(
			sprintf(',%s,',$_SESSION['local_dep_list']),
			sprintf(',%d,',$dep_id)) ?1:0;
		$hd['DATEOF']=time_to_db_date(time());
			$hd['TYPE_ID']=$type_id;
			$hd['DEP_ID']=$dep_id;
		$ddn=$db->db_quer("
			select dd.name from local_dep_list l
				left join fr_departments dd on
					dd.agent_id=l.agent_id and dd.dep_id=l.dep_id
					and dd.dep_id=$dep_id
			where dd.name is not null");
		if (sizeof($ddn)<1) throw new Exception(
				"Неизвестное (недоступное) подразделение #$dep_id!");
			$ddn=$ddn[0]['NAME'];
				$hd['DEP_NAME']=$ddn;
			$ddn=$db->db_quer("
				select t.name from st_operationtypes t
					where t.id=$type_id");
		if (sizeof($ddn)<1) throw new Exception(
				"Неизвестный тип документа #$type_id!");
			$ddn=$ddn[0]['NAME'];
				$hd['TYPE_NAME']=$ddn;
		$resp['title']='*новый';
	} else {
		// существующий документ
		$r=$r['data'][0];
			$type_id=$r['TYPE_ID'];
		$resp['title']=sprintf('№%d/%d от %s',
			$r['DEP_ID'], $r['DOCNO'],
			strftime('%d.%m.%Y',db_date_to_time($r['DATEOF'])) );
		$hd=$r; $hd['isLocalDoc']=strstr(
			sprintf(',%s,',$_SESSION['local_dep_list']),
			sprintf(',%d,',$hd['DEP_ID'])) ?1:0;
	} $resp['hd']=$hd;

	$iif=
		($db->db_type=='ibase'?'iif':'if');
	$cndsgtin="$iif(se127.data<>'','1', '0')";

// порядок отображения столбиков текущих и старых значений
	if ((int)$hd['STATUS']%10<1)
		{$sts1='old_'; $sts2='new_';}
	else
		{$sts1='new_'; $sts2='old_';}

//строки
	$r=$db->db_query("
		select 
			ss.supno, x.id as item_id, st.qua,
			ss.price, st.qua*ss.price as summa,
				ss.expdate as $sts1"."expdate, ' ' as $sts2"."expdate,
				ss.series as $sts1"."series, ' ' as $sts2"."series,
				$cndsgtin as $sts1"."sgtin_mark, '0' as $sts2"."sgtin_mark,
			p.name as pname, v.name as vname, n.name as nname,
				d.dep_id, d.name as dep_name 
		from st_oper_itm_exti iie
			left join st_supitems ss on ss.supno=iie.lineno -- в lineno хранится supno
			left join fr_items x on x.id=ss.item_id
			left join st_storage st on st.supno=ss.supno
				and st.dep_id=iie.valf
			left join fr_product p on p.id=x.product_id
			left join fr_vendor v on v.id=x.vendor_id
			left join fr_country n on n.id=v.country_id
			left join st_supitems_exti se127 on
				se127.supno=ss.supno and se127.ext_id=127
			left join fr_departments d on d.dep_id=st.dep_id
		where
			iie.dep_id=$dep_id and iie.id=$id
			and ss.uid is not null
		--	and st.uid is not null
			group by 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16"); //#25780

// свойства параметров
	$props=$db->db_query("
		select 
			iie.lineno as supno, iie.ext_id,
			iie.valc, iie.valf
		from st_oper_itm_exti iie
		where
			iie.dep_id=$dep_id and iie.id=$id");

// значения второго столбика
	if (sizeof($props['data'])>0) {
		foreach($r['data'] as $k1=>$v1){
			foreach($props['data'] as $k2=>$v2){
				if ($v1['SUPNO']==$v2['SUPNO']){
					if ($v2['EXT_ID']==9301)
						$r['data'][$k1][strtoupper($sts2.'expdate')]=$v2['VALC'];
					if ($v2['EXT_ID']==9302)
						$r['data'][$k1][strtoupper($sts2.'series')]=$v2['VALC'];
					if ($v2['EXT_ID']==9303){
						$r['data'][$k1][strtoupper($sts2.'sgtin_mark')]=
							$v2['VALC']=="1" ? "1" : "0";
						$r['data'][$k1]['DEP_ID']=intval($v2['VALF']);
					}
				}
			}
		}
	}

	$db->jsonPrepare($r); $resp['rows']=$r;
	return $resp;
}

function save()
{
	global $env, $db, $remote_ip, $user_id, $site;
		$dep_id=intval($_REQUEST['dep_id']);
		$id=intval($_REQUEST['id']);
	$dateof=time_to_db_date(db_date_to_time($_REQUEST['dateof']));
		$comment=$db->escape_string(trim($_REQUEST['comment']));

	$rows=array(); foreach($_REQUEST['rows'] as $v) {
		$nseries=(array_key_exists('new_series',$v)
				&& (strlen(trim($v['new_series']))>0)) ?
					$db->escape_string(trim($v['new_series'])) : "-1";
		$nexpdate=(array_key_exists('new_expdate',$v)
				&& (strlen(trim($v['new_expdate']))>0)) ?
					$db->escape_string(trim($v['new_expdate'])) : "-1";
		$nsgtinm=(array_key_exists('new_sgtin_mark',$v)
				&& (strlen(trim($v['new_sgtin_mark']))>0)) ?
					$db->escape_string(trim($v['new_sgtin_mark'])) : "-1";
		$rows[]=array(
			'item_id'=>intval($v['item_id']),
			'supno'=>intval($v['supno']),
			'dep_id'=>intval($v['dep_id']),//чтобы при открытии документа открывалось корректное подразделение
			'series'=>$nseries,//=iconv('UTF-8','CP1251',$nseries),//правильно преобразовать символы
			'expdate'=>$nexpdate,
			'sgtin_mark'=>$nsgtinm, );
	}

// параметры для записи в st_oper_itm_exti
// ext_id 93 - тип документа, 00 - порядковый номер параметра
	$props=array(); foreach($rows as $v){
		if (array_key_exists('expdate',$v)
				&& $v['expdate']!="-1"){
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9301,
				'valf'=>(intval($v['dep_id'])),//знать к какому подразделению относится строчка
				'valc'=>$v['expdate'], );
			$props[]=$st_line; }
		if (array_key_exists('series',$v)
				&& $v['series']!="-1"){
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9302,
				'valf'=>(intval($v['dep_id'])),//знать к какому подразделению относится строчка
				'valc'=>$v['series'], );
			$props[]=$st_line; }
		if (array_key_exists('sgtin_mark',$v)
				&& $v['sgtin_mark']!="-1"){
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9303,
				'valf'=>$dep_id, // марк на локальное // (intval($v['dep_id'])) //знать к какому подразделению относится строчка
				'valc'=>intval($v['sgtin_mark'])==1 ? "1" : '', );
			$props[]=$st_line; }
	}

	$env->logS("[$remote_ip/$user_id] save($dep_id/$id):
		comment=$comment;");

// header
	$dh=$site->cf('fm_doc_header');
		$dh->_verbose=0;
	if (!$id) {
		$type_id=intval($_REQUEST['type_id']);
		if (!$type_id) return false;
		$dh_data=array('dep_id'=>$dep_id, 'type_id'=>$type_id);
	} else
		$dh_data=array('dep_id'=>$dep_id, 'id'=>$id);
		if (!$dh->load($dh_data)) return;
	if ($dh_data['header']['STATUS']%10>0)
		throw new Exception("Документ проведен!");
	$dh_data['header']['DATEOF']=$dateof;
	$dh_data['header']['COMMENT']=$comment;
	$dh_data['header']['USER_ID']=$user_id;
		if (!$dh->save($dh_data)) return;
	if (!$id) {
		$id=$dh_data['header']['ID'];
		$env->logS("\tsave($dep_id/NEW.$id)"); }

//props записать новые значения
	$db->db_quer($db->db_type=='ibase'
		?"select * from pr_check_st_oper_itm_exti(
			0,$dep_id,$id,:lineno,:ext_id,:valf,:valc)"
		:"insert into st_oper_itm_exti(
			uid, dep_id, id, lineno, ext_id, valf, valc
		) values (
			gen_id(g_st,1), $dep_id, $id, :lineno, :ext_id, :valf, :valc
		) on duplicate key update
			uid=gen_id(g_st,1), valf=:valf, valc=:valc",$props);

// #25008 строки ..только для репликации
	$db->db_exec_query("
		update st_operationitems set uid=gen_id(g_st,1), qua=0, summa=0 
			where dep_id=$dep_id and id=$id");
	$db->db_quer($db->db_type=='ibase' // #25851
		?"select * from pr_check_st_operationitems(
			0,$dep_id,$id,:lineno,:item_id,:supno,1,0,0,0,0,0)"
		:"insert into st_operationitems(
			uid, dep_id, id, lineno, item_id, supno, qua
		) values (
			gen_id(g_st,1), $dep_id, $id, :lineno, :item_id, :supno, 1
		) on duplicate key update
			uid=gen_id(g_st,1), item_id=:item_id, supno=:supno, qua=1",$rows);

	$db->commit(); return $this->load($dep_id,$id);
}

function post()
{
	global $env, $db, $dbt, $remote_ip, $user_id, $site;
		$dep_id=intval($_REQUEST['dep_id']);
		$id=intval($_REQUEST['id']);
		$rows=$_REQUEST['rows'];
	$env->logS("[$remote_ip/$user_id] post($dep_id/$id)");

	$dh=$site->cf('fm_doc_header');
		$dh->_verbose=0;
	$dh_data=array('dep_id'=>$dep_id, 'id'=>$id);
		if (!$dh->load($dh_data)) return;
	if ($dh_data['header']['STATUS']%10>0)
		throw new Exception("Документ проведен!");

// в st_supitems новое значение
	foreach ($rows as $v){
		$cond='';
		if (array_key_exists('new_series',$v)
				&& strlen(trim($v['new_series']))>0){
			$strns=addslashes(trim($v['new_series']));
			$cond=$cond.",series='$strns' ";
		}
		if (array_key_exists('new_expdate',$v)
				&& strlen(trim($v['new_expdate']))>0){
			$strne=time_to_db_date(db_date_to_time(trim($v['new_expdate'])));
			$cond=$cond.",expdate='$strne' ";
		}

		if (strlen(trim($cond))>0){
			if ($db->db_type=='ibase'){
				$conddb=iconv('UTF-8','CP1251',$cond);
				$db->db_exec_query("
					update st_supitems set
						uid=-uid
						$conddb
					where supno=".$v['supno']);
			}
			
			$cond=substr($cond,1);
			$dbt->db_exec_query("
				update st_supitems set
					$cond
				where supno=".$v['supno']);
		}

	//sgtin
		if (
			array_key_exists('new_sgtin_mark',$v)
			&& strlen(trim($v['new_sgtin_mark']))>0
		) {
		// поставить признак марк как обычно
			if ($v['new_sgtin_mark']=="1")
				$db->db_quer($db->db_type=='ibase' // #25851
					?"select * from pr_check_st_supitems_exti(
						0,:dep_id,:supno,127,'1')"
					:"insert into st_supitems_exti(
						uid, dep_id, supno, ext_id, data
					) values (
						gen_id(g_st,1), :dep_id, :supno, 127, :data
					) on duplicate key update
						uid=gen_id(g_st,1), data='1'",
				array(array(
					'dep_id' => $v['dep_id'], 'supno' => $v['supno'] ))
				);
			else {
				if ($v['new_sgtin_mark']!=$v['old_sgtin_mark']){
			// убрать признак марк в зависимости от подразделения
					$rdep=$db->db_quer("
						select dep_id
						from st_supitems_exti
						where supno=:supno and ext_id=127", 
					array(array( 'supno' => $v['supno'], )));
					if (is_array($rdep) && sizeof($rdep)>0){
						$rdep=$rdep[0]['DEP_ID'];
							$genuid='';
						if ($dep_id==$rdep)
							$genuid=' uid=gen_id(g_st,1), ';
						$db->db_exec_query("
							update st_supitems_exti
							set $genuid data=''
							where supno=:supno and ext_id=127", 
						array(array( 'supno' => $v['supno'], ))
						);
					} else 
						throw new Exception("Нет маркировки для снятия!");
				}
			}
		}
	} $db->commit(); $dbt->commit();

//в st_oper_itm_exti старое значение
//параметры для записи в st_oper_itm_exti
	$props=array();
	foreach($rows as $v){
		if (array_key_exists('old_expdate',$v)
				&& strlen(trim($v['old_expdate']))>0){
			$stroe=time_to_db_date(db_date_to_time(trim($v['old_expdate'])));
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9301,
				'valc'=>$stroe, );
			$props[]=$st_line; }
		if (array_key_exists('old_series',$v)
				&& strlen(trim($v['old_series']))>0){
			$stros=addslashes(trim($v['old_series']));
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9302,
				'valc'=>$stros, );
			$props[]=$st_line; }
		if (array_key_exists('old_sgtin_mark',$v)){
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9303,
				'valc'=>$v['old_sgtin_mark']=="1" ? '1' : '', );
			$props[]=$st_line; }
	}

	$db->db_exec_query("
		update st_oper_itm_exti set
			uid=gen_id(g_st,1),
			valc=:valc
		where
			dep_id=$dep_id and id=$id
			and lineno=:lineno
			and ext_id=:ext_id",$props);

	$dh->post($dep_id,$id);
	$db->commit();

	return $this->load($dep_id,$id);
}

function unpost()
{
	global $env, $db, $dbt, $remote_ip, $user_id, $site;
		$dep_id=intval($_REQUEST['dep_id']);
		$id=intval($_REQUEST['id']);
		$rows=$_REQUEST['rows'];
	$env->logS("[$remote_ip/$user_id] unpost($dep_id/$id)");

	$dh=$site->cf('fm_doc_header');
		$dh->_verbose=0;
	$dh_data=array('dep_id'=>$dep_id, 'id'=>$id);
		if (!$dh->load($dh_data)) return;
	if ($dh_data['header']['STATUS']%10==0)
		throw new Exception("Документ уже распроведен!");

//в st_supitems старое значение
	foreach ($rows as $v){
		$cond='';
		if (array_key_exists('old_series',$v)
				&& strlen(trim($v['old_series']))>0){
			$stros=addslashes(trim($v['old_series']));
			$cond=$cond.",series='$stros' ";
		}
		if (array_key_exists('old_expdate',$v)
				&& strlen(trim($v['old_expdate']))>0){
			$stroe=time_to_db_date(db_date_to_time(trim($v['old_expdate'])));
			$cond=$cond.",expdate='$stroe' ";
		}

		if (strlen(trim($cond))>0){
			if ($db->db_type=='ibase'){
				$conddb=iconv('UTF-8','CP1251',$cond);
				$db->db_exec_query("
					update st_supitems set
						uid=-uid
						$conddb
					where supno=".$v['supno']);
			}

			$cond=substr($cond,1);
			$dbt->db_exec_query("
				update st_supitems set
					$cond
				where supno=".$v['supno']);
		}
	} $db->commit(); $dbt->commit();

//в st_oper_itm_exti новое значение
//параметры для записи в st_oper_itm_exti
	$props=array();
	foreach($rows as $v){
		if (array_key_exists('new_expdate',$v)
				&& strlen(trim($v['new_expdate']))>0){
			$strne=time_to_db_date(db_date_to_time(trim($v['new_expdate'])));
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9301,
				'valc'=>$strne, );
			$props[]=$st_line; }
		if (array_key_exists('new_series',$v)
				&& strlen(trim($v['new_series']))>0){
			$strns=addslashes(trim($v['new_series']));
			$st_line=array(
				'lineno'=>intval($v['supno']),
				'ext_id'=>9302,
				'valc'=>$strns, );
			$props[]=$st_line; }
	}

	$db->db_exec_query("
		update st_oper_itm_exti set
			uid=gen_id(g_st,1),
			valc=:valc
		where
			dep_id=$dep_id and id=$id
			and lineno=:lineno
			and ext_id=:ext_id",$props);

	$dh->unpost($dep_id,$id);
	$db->commit();

	return $this->load($dep_id,$id);
}

// поиск строк
function item_sea($afterReload=false)
{
	global $env, $db, $dbt, $dban, $site, $remote_ip, $user_id;
	$lag=$_SESSION['local_agent_list'];
		$text = utf8_strtoupper(trim($_REQUEST['query']));
		$text = $dbt->escape_string($text);
	$dep_id = intval($_REQUEST['dep_id']);
	$id = intval($_REQUEST['id']);

// по наименованию
	$sa = array();
	foreach(explode(' ',$text) as $str) {
		$str=trim($str);
		if (strlen($str)<1) continue;
		$not=(strlen($str)>0 && $str[0]=='!')?'not':'';
			if ($not) $str=substr($str,1);
		$sa[]="upper(p.name) $not like upper('%$str%')";
	} if (sizeof($sa)<1) return array();
	$cond=implode(' and ',$sa);
	$env->logS($cond);
	
	/* $dn = array();
	foreach(explode(' ',$inputDepNameValue) as $strN) {
		$strN=trim($strN);
		if (strlen($strN)<1) continue;
		$not=(strlen($strN)>0 && $strN[0]=='!')?'not':'';
			if ($not) $strN=substr($strN,1);
		$dn[]="upper(p.name) $not like upper('%$strN%')";
	} if (sizeof($dn)<1) return array();
	$condN=implode(' and ',$dn);
	$env->logS($condN); */
	
	if ($db->db_type=='ibase')
		$cond=iconv('utf-8','cp1251', $cond);
	$dep_name= 'академ';
	$dep_name1251=iconv('utf-8','cp1251', $dep_name);
	$env->logS($dep_name1251);
	$r=$db->db_query("
		select
			st.supno, st.item_id, st.qua,
			ss.price, st.qua*ss.price as summa,
			ss.expdate as old_expdate, ss.series as old_series,
			p.name as pname, v.name as vname, n.name as nname,
			se127.data as old_sgtin_mark, d.dep_id, d.name as dep_name
		from fr_product p
			left join fr_items x on x.product_id=p.id
				and p.flags not like '%%X%%'
			left join fr_vendor v on v.id=x.vendor_id
				and v.flags not like '%%X%%'
			left join fr_country n on n.id=v.country_id
				and n.flags not like '%%X%%'
			left join st_storage st on st.item_id=x.id
			 	and st.qua>0.001
			left join st_supitems ss on ss.supno=st.supno
			left join st_supitems_exti se127 on
				se127.supno=ss.supno and se127.ext_id=127
			left join fr_departments d on d.dep_id=st.dep_id
			--	and d.agent_id in ($lag)
				and d.flags not like '%%X%%'
		where $cond
			and x.uid is not null
			and st.uid is not null
			and ss.uid is not null
			-- and d.dep_id in (181)
			and upper(d.name) like upper('%$dep_name1251%')
		order by p.name, ss.series");
	return $r;
}

private function _init_data()
{
	global $env, $db;
		$resp=array();
	$depr=array(); $depw=array(); foreach(
		$_SESSION['RIGHTS']['Storages']	as $dep_id=>$v
	) {
		if ($v['rights']=='write') $depw[]=$dep_id;
		$depr[]=$dep_id; }
	$depr=implode(',',$depr); if (!$depr) $depr='-1';

// подразделения, куда можем писать
	$depw=implode(',',$depw);
		if (!$depw) $depw='-1';
	$r=$db->db_query("
		select
			dd.dep_id as id, dd.name, dd.agent_id
		from local_dep_list l
			left join fr_departments dd on
				dd.agent_id=l.agent_id and
			dd.dep_id=l.dep_id and -- писать можем только в локальные!
				dd.dep_id in ($depw) and
				dd.flags not like '%_X_%'
		where dd.dep_id is not null
			group by 2,1,3");
	$db->jsonPrepare($r); $resp['depaw']=$r;

	return $resp;
}

function get_html()
{
	global $env, $site_root, $site;
		$this->_replace_log(__FILE__);

	write_header(__FILE__,'extjs3m');

	write_body_text("<script>
		document._init_data=".json_encode($this->_init_data()).";
	</script>");

	$fm=$site->cf('fm_dir_period');  $fm->write_frame_frontend();
	$fm=$site->cf('fm_dir_items');  $fm->write_frame_frontend();

	$fm=$site->cf('fm_doc_print');  $fm->write_frame_frontend();
	$fm=$site->cf('fm_doc_parent');  $fm->write_frame_frontend();

	$fm=$site->cf('fm_sgtin');  $fm->write_frame_frontend();
	$fm=$site->cf('j_supno'); $fm->write_frame_frontend();
	$fm=$site->cf('dv_st'); $fm->write_frame_frontend();

	write_body_js(__FILE__); write_footer(get_class($this));
}

}

?>
