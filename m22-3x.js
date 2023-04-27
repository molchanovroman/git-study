
// #26146 extJs.34 library

/**

 * m22-3x: library
 * 
 * (C) 2012 Mukhin Vyacheslav, http://oasis38.ru
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; 
 * See http://www.gnu.org/copyleft/lesser.html
 *
 * Do not remove this comment if you want to use the script!
 *
 * @author Mukhin Vyacheslav && oasis(ko) [office@oasis38.ru]
 */

// доступ к Ext-объектам по их ID
function xg(id) {return Ext.ComponentMgr.get(id);}

Ext.focusedEl = function()
{
	var focusedEl=null,
		all=Ext.ComponentMgr.all.items;
	for(var i in all) {
		if (all[i] instanceof Function) continue;
		if (all[i].hasFocus) {
			focusedEl=all[i]; break;
		}
	}
	return focusedEl;
}

function logout()
{
	var 
		el=document.createElement('iframe');
	m2_show_status_win('Выход из системы','red');
		el.style.position='fixed'; el.style.visibility='hidden';
		el.style.left=-1; el.style.top=-1;
		el.style.right=-1; el.style.bottom=-1;
	el.src='?logout';
		document.body.appendChild(el);
	window.setTimeout(function(){
		window.location.reload(); },1000);
}

function alert_tm(delay,text,title,icon,handler)
{window.setTimeout(function(){
	alert2(text,title,icon,handler);
},delay);}

function alert2i(text,handler){
	alert2(text,'Инфо.',Ext.MessageBox.INFO,handler);}

function alert2w(text,handler){
	alert2(text,'Предупреждение',Ext.MessageBox.WARNING,handler);}

function alert2(text,title,icon,handler)
{
	var s, ns, focusedEl=Ext.focusedEl();
		if (!title) title='Ошибка';
		if (!icon) icon=Ext.MessageBox.ERROR;
		m2_hide_status_win();
	text=str_replace('\n','<br>',(String)(text));
	text=str_replace('&nbsp;',' ',(String)(text));
		s=text.split('<br>');
	if (s.length>25) {
		ns=[]; for(var i in s) {
			if (s[i] instanceof Function) continue;
			ns[ns.length]=s[i];
			if (ns.length>25) break;
		} 
		ns[ns.length]='... и т.д.'; s=ns;
	}
	text=s.join('<br>');
	Ext.Msg.show({
		title:title, msg:text, 
			buttons: Ext.Msg.OK, icon: icon,
			minWidth:500,
		fn:  function(btn, text){ 
			if (handler instanceof Function)
				handler(btn, text);
			else window.setTimeout(function(){
				if (focusedEl) focusedEl.focus();
			},100);
		},
		// animEl: 'elId', 
	});
	if (document._debug_m2_show_status_win) console.logDt(sprintf('alert2(%s)',text));
}

// YesNoCancel для Ext.Msg.confirm
if (
	Ext && Ext.MessageBox &&
	Ext.MessageBox.confirm instanceof Function
) Ext.MessageBox.confirm=function(title, msg, fn, scope){
	this.show({
		title : title,
		msg : msg,
		buttons: this.YESNOCANCEL, // this.YESNO,
		fn: fn,
		scope : scope,
		icon: this.QUESTION,
		minWidth: 500, //this.minWidth
	});
	return this;
};

// confirm с галкой "больше не спрашивать"
if (!Ext.MessageBox) Ext.MessageBox={}; // #26107
Ext.MessageBox.confirmSave=function(title, msg, callback, scope){
	var 
		mk=md5(title+': '+msg),
		lk=localStorageKey()+'.confirm.'+mk,
	ld=localStorage.getItem(lk); if (ld) {
		console.warn('confirmSave('+title+').was='+ld);
		return callback(ld); } // уже спрашивали?
	msg=msg+'<div style="margin-top:10px;">'+
		'<input id=confirmNa type=checkbox style="vertical-align:middle;margin-right:5px;"></input>'+
		'<label for=confirmNa style="vertical-align:middle;">больше не спрашивать</label></div>';
	this.show({
		scope : scope, title : title, msg : msg,
			buttons: this.YESNOCANCEL, // this.YESNO,
		fn: function(btn){
			if (btn=='cancel') return;
			if ($g('confirmNa').checked) // запомним ответ
				ld=localStorage.setItem(lk,btn);
			callback(btn); },
		icon: this.QUESTION, minWidth: this.minWidth
	}); return this;
};

// размеры окна для Ext.Msg.prompt(title, caption, function(btn,text){}, 0, true, text) ...
Ext.MessageBox.minPromptWidth=400;
Ext.MessageBox.defaultTextHeight=300;

// обработка (отображение) ошибок (exception's)
Ext.Error.handle = function(err) {
	var msg = (String)(err.msg);
	//msg = str_replace("You're trying to decode an invalid JSON String: ","",msg);
	alert2("ОШИБКА:\n"+msg);
}

// замена для prompt
/* prompt2({
		header:'Ввод', title:'Числа', value:123, 
			width:350, height:150, position:'top/center', readOnly:false, 
			el:{xtype:'numberfield', allowBlank:true,}, 
		onSuccess:function(value, opt, w){
			opt.canClose=false; ... w.close();
		},
		onCancel:function(){}, 
	})); */
function prompt2(opt)
{
	if (!opt || !opt.onSuccess) throw(
		'usage of prompt2({header:"Ввод", title:"Числа", value:123, '+
		'  width:350, height:150, position:"top/center", readOnly:false, '+
		'  el:{xtype:"numberfield", allowBlank:true,}, '+
		'  onSuccess:function(value){}, onCancel:function(){}, })');
	if (!opt.header) opt.header='Введите значение';
		if (!opt.title) opt.title='Строка';
		if (!opt.title && !opt.value) opt.value='строка...';
		if (!opt.width) opt.width=300;
		if (!opt.height) opt.heigh=157;
	if (!opt.el) opt.el={xtype:'textfield'};
		opt.el.id='edPrompt2Value';
	if (!opt.el.fieldLabel) opt.el.fieldLabel=opt.title;
		if (!opt.el.value && opt.value) opt.el.value=opt.value;
	var w={
		id:'winPrompt2Value', title: opt.header,
			modal: true, resizable: false,
			closeAction: 'close', //=free
		height: opt.height, width: opt.width, 
			border:false,
		listeners:{
			afterrender:function(){
				var hkc={
					key: Ext.EventObject.RETURN, 
					fn: function(el,e){ 
						e.stopEvent(); opt.canClose=true;
						opt.onSuccess(xg('edPrompt2Value').getValue(), opt, w);
						if (opt.canClose) w.close(); } };
					if (opt.el.xtype=='textarea') hkc.ctrl=true;
				new Ext.KeyMap(
					xg('edPrompt2Value').getEl().dom, [hkc]); },
			show:function(){ window.setTimeout(function(){
					xg('edPrompt2Value').focus();
				},250); },
			hide:function(){
				if (opt.onCancel instanceof Function) opt.onCancel();
			}},
		layout: 'form', labelAlign:'top',
			bodyStyle:'padding:10px; background-color:aqua;',
			defaults:{anchor:'100%',},
		items: [opt.el],
			buttonAlign:'left',
		fbar:[{
			text:'<b>OK</b>', 
				disabled:!!opt.readOnly,
			handler:function(){ opt.canClose=true;
				opt.onSuccess(xg('edPrompt2Value').getValue(), opt, w);
				if (opt.canClose) w.close(); }
		}, '->', {
			text:'Отмена', handler:function(){ w.close(); }
		}]
	}; if (opt.position=='top') {
		w.x=5; w.y=5;
	} // console.log(w);
	w=new Ext.Window(w); w.show();
}

//Перевод с русского на английский для RFID-браслетов
function formatRfid(input) { return translit(input); }

// открыть вкладку (либо новую, либо просто перейти на нее)
function m2_open_browser_tab_223(tabID,url) {
	return M2.openNewTab(tabID,url); }

// загрузка файлов в браузер без разрешения на "модальное окно"
function m2_hidden_download(url) {
	return M2.iframeDownload(url); }

// статусное окно
M2.showStatusWin = function (text,color,el) {
	if (text === undefined) text = "&nbsp;";
	if (document._debug_m2_show_status_win)
		console.logDt(sprintf('m2_show_status_win(%s)',text));
	//if (!document._status) document._status={};
	if (!el) el = Ext.getBody();

	if (Ext.versions) {
// extJs.7x
		el=document.view; if (!el) {
			console.error('m2_show_status_win(): document.view = null');
			return; }
		var lm = new Ext.LoadMask({
			msg: '<span style=" font-weight:bold;text-align:center; font-size:14px; color:'
				+color+'"'+'>'+text+'</span>',
			target : el}); lm.show();
		if (!document.status_win) document.status_win=[];
		document.status_win.push(lm); // используем "стек"

	} else {
// extJs.34
		m2_hide_status_win();
		document.status_win = new Ext.LoadMask(el, {
			msg: '<span style=" font-weight:bold;text-align:center; font-size:14px; color:'
				+color+'"'+'>'+text+'</span>',
			addMask: true});
		document.status_win.show();

	// Надо перекрыть все окна фоном.
		var zindex=-1; if (Ext.get(el).last('.x-window')) {
			var style = Ext.get(el).last('.x-window').getStyles('z-index');
			if(style['z-index'])
				zindex = parseInt(style['z-index']);
		} if(zindex>0)
			Ext.get(el).last('.ext-el-mask').setStyle('z-index',zindex+500);
	}
}; m2_show_status_win = M2.showStatusWin;

M2.hideStatusWin = function() {
	if (!document.status_win) return;
		if (document._debug_m2_show_status_win) console.logDt('  m2_HIDE_status_win');
	if (Ext.versions) {
// extJs.7x
		if (document.status_win_hider) {
			window.clearTimeout(document.status_win_hider);
			document.status_win_hider=null; }
		document.status_win_hider=window.setTimeout(function(){
			document.status_win.forEach(function(lm){
				lm.hide(); lm.destroy(); }); // очистим "стек"
			document.status_win=null; document.status_win_hider=null;
		},107);
	} else {
// extJs.34
		if (document.status_win.hide)
			document.status_win.hide(); 
		document.status_win=null;
	}
}; m2_hide_status_win = M2.hideStatusWin;

// --------------------------------------
function m2_str_to_float(text,canNaN) {
	return str2float(text,canNaN); }

// --------------------------------------
// функции форматирования ячеек

// отрисовка ячейки с галкой ... по мимо renderer надо указать grid:'ID-грида'
	// column definition must be like:
	//	{dataIndex:'SELECTED', renderer:rndChckSelect, grid:'dbgX', }
	// имя поля может быть любым (не только SELECTED)
// grid.onCheckClick(se,fn) - сторонний обработчик переключения галки

// для вкл/выкл всех галок в гриде можно использовать 
//		searcher.chckOnOff(on,fieldName,onSuccess)

function rndChckSelect(value, metadata, record, rowIndex, colIndex, store, scope){
	var 
		gn=null, fn=null, t='',
		imgOn='chck_on', imgOff='chck_off'; 
	if (!PICONS) {
		imgOn=sprintf('images/_%s.png',imgOn);
		imgOff=sprintf('images/_%s.png',imgOff); }
	if (!scope) // испльзуется для ручного вызова из собственного обработчика rnd()
		scope=this.scope; // т.е надо вызывать: rndChckSelect(value,..., this.scope)
	if (scope && scope.grid) {
		gn=scope.grid; fn=scope.dataIndex; }
	if (scope && scope.imgOn) imgOn=scope.imgOn;
		if (scope && scope.imgOff) imgOff=scope.imgOff;
	metadata.style=metadata.style+'text-align:center;vertical-align:middle;';
// описание картинки
	if (gn && xg(gn).searcher.conf.getChkTooltip instanceof Function)
		t=' title="'+xg(gn).searcher.conf.getChkTooltip(record.data,rowIndex,colIndex,fn)+'" ';

// имя картинки
	if (
		gn && xg(gn).searcher.conf.getChkImg instanceof Function
	)  {
		var 
			img=xg(gn).searcher.conf.getChkImg(record.data,fn,metadata);
		if (!img) {
			value=''; return value; }
		onclick=
			'onclick="rndChckSelect__chckDo(\''+gn+'\',\''+fn+'\','+rowIndex+','+colIndex+');"';
		value = 
			'<div style="white-space:normal;"><img '+onclick+t+' src="'+
			(PICONS?PICONS[img]:document.site_root+img)+'"></div>';
		return value;
	}

// картинка по-умолчанию
	var onclick=''; if (gn) onclick=
		'onclick="rndChckSelect__chckDo(\''+gn+'\',\''+fn+'\','+rowIndex+','+colIndex+');"';
	if (parseInt(value))  value='<img '+onclick+t+' src="'+
		(PICONS?PICONS[imgOn]:document.site_root+imgOn)+'">';
	else value='<img '+onclick+t+' src="'+
		(PICONS?PICONS[imgOff]:document.site_root+imgOff)+'">';
	value = 
		'<div style="white-space:normal;">'+value+'</div>';
	return value;
}
function rndChckSelect__chckDo(grid,fn,row,col){
	var se=xg(grid).searcher;
		se.focus_cell(row,col);
	window.setTimeout(function(){
		if (xg(grid).onCheckClick instanceof Function) {
			xg(grid).onCheckClick(se,fn); return; }
		if (xg(grid).searcher.conf.onCheckClick instanceof Function) {
			xg(grid).searcher.conf.onCheckClick(se,fn); return; }
		if (xg(grid).searcher.conf.editor instanceof Function) {
			xg(grid).searcher.conf.editor(se,fn); return; }
		var rec=se.selected;
			if (rec.data[fn]) rec.data[fn]=0; else rec.data[fn]=1;
		se.save_row(); 
	},50);
}

function rndFIO(value, metadata, record, rowIndex, colIndex, store) {
	return fmtFIO(value);
}

function rndDate(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
	if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	// if (d.getTime()<0) return ''; else ... ранее 1970 не отображает?!
	return d.asDateString2();
}
function rndDate4(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
	if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	// if (d.getTime()<0) return ''; else ... ранее 1970 не отображает?!
	return d.asDateString();
}
function rndDateTime(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
	if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	return d.asDateString()+' <span style="color:gray;">'+s[1]+'</span>';
//	return d.asDateTimeString();
}
function rndDateTime2(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
	if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	return d.asDateString2()+' <span style="color:gray;">'+s[1]+'</span>';
}

function rndDateTime2b(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	if (s[1]=='00:00:00') return d.asDateString2();
		else return d.asDateString2()+' <span style="color:navy;">'+s[1]+'</span>';
}

function rndDateTime2r(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	if (s[1]=='00:00:00') return d.asDateString2();
		else return d.asDateString2()+' <span style="color:red;">'+s[1]+'</span>';
}

function rndTime(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	return s[1];
}

function rndTime2(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	return sprintf('%02d:%02d',d.getHours(),d.getMinutes());
}

function rndTimeDate(value, metadata, record, rowIndex, colIndex, store)
{
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	return s[1]+' <span style="color:gray;">'+d.asDateString()+'</span>';
//	return d.asDateTimeString();
}

function rndTimeDate2(value, metadata, record, rowIndex, colIndex, store)
{
	
	var d = new Date();
		value = (String)(value);
		if (isDbDateEmpty(value)) return '';
//alert(value);
	if (value.indexOf('-')>1) d.fromDateTimeStringYYMMDD(value); 
		else d.fromDateTimeString(value);
	var s = d.asDateTimeString();
		s = s.split(' ');
	return s[1]+' <span style="color:gray;">'+d.asDateString2()+'</span>';
}

// ---------------------------------------------------
// отрисовка кол-ва с делителем и кратностью
function rndDvQua(value, metadata, record, rowIndex, colIndex, store)
{
	value=fmtDvQua(value, record, true);
		metadata.style=metadata.style+'text-align:right;';
	return value;
}

// -- кол-во/сумма ---------------------
function M2_data_format_summa(v,split_to_tetrades) {
	return fmtSumma(v,split_to_tetrades); }

function rndQuaNeg(value, metadata, record, rowIndex, colIndex, store)
{
	if (value<0) metadata.style=metadata.style+'color:red;';
	return rndQuaT(value, metadata, record, rowIndex, colIndex, store);
}

function rndQua(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=metadata.style+'text-align:right;'; // color:blue;
	value=fmtQua(value); return value;
}

function rndQuaT(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=metadata.style+'text-align:right;'; // color:blue;
	value=fmtQua(value,3,true); return value;
}

function rndQua6(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=metadata.style+'text-align:right;'; // color:blue;
	value=fmtQua(value,6); return value;
}

function rndSumma(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=
		metadata.style+'text-align:right;'; // color:blue;
	value = M2_data_format_summa(value);
	return value;
}

function rndSummaT(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=
		metadata.style+'text-align:right;'; // color:blue;
//alert(metadata.style);
	value = M2_data_format_summa(value,true);
	return value;
}

function rndSummaTc(value, metadata, record, rowIndex, colIndex, store)
{
	if (value<0) metadata.style=metadata.style+'color:red;';
	return rndSummaT(value, metadata, record, rowIndex, colIndex, store);
}

function rndFileSize(value, metadata, record, rowIndex, colIndex, store)
{
	metadata.style=metadata.style+'text-align:right;';
	value=fmtFileSize(value); return value;
}

// Применение нескольких функций рендеринга на одну ячейку
// Пример:
//  {
// 		dataIndex:"DATEOF",
// 		header:"Дата тура",
//		renderer:rndFn.bind([rndDateTime2,rndBuyColor])
//  }
function rndFn(value,metadata,record,rowIndex,colIndex,store) {
	for (var fn of this) value = fn(
		value,metadata,record,rowIndex,colIndex,store);
	return value;
}

// --------------------------------------
// маскирование символа "+"
// т.к. при передаче по ajax от превращается в " "?!
function _mask_plus(text)
{
	text=str_replace('+','^',text);
		text=str_replace('«','<^',text);
		text=str_replace('»','^>',text);
	return text;
}

// --------------------------------------
// почему-то так не прокатывает на extjs-3.4 ... глючит!
function m2_Ext_Ajax0(func_name,params,success_func,url,error_func) {
	return ajax(func_name,params,success_func,url,error_func,false,15); }

// простой запрос к backend
//		func_name	- имя функции на сервере
//	*	params		- параметры функции
//	*	success_func- вызавается после успошного выполнения запроса
//	*	url		- url страницы на сервере
//	* - не обязательные поля
function m2_Ext_Ajax(func_name,params,success_func,url,error_func)
{
	var tmp_timeout= // #25034 чтоб timeout не терялся
		params && params.timeout 
		? params.timeout : 30*1000; // 3*60*1000 = 3 min.
	if (!url) url = document.self;
		if (!params) params={};
// #24117 запакуем запрос в base64()
	if (document._ajaxUseBase64) { 
		params=JSON.stringify(params);
		params=base64_encodem(params);
		params={q64:params};
	} params.q = func_name;
		params.timeout=tmp_timeout;//#25034
	if (params.timeout)	Ext.Ajax.timeout=params.timeout; else
		if (document._ajaxTimeout) Ext.Ajax.timeout=document._ajaxTimeout; 
	var 
		started=(new Date()).getTime(), ak=''+func_name; // ak=sprintf('%s/%s/%s', func_name, url, JSON.stringify(params));
	if (!document._ajaxC) {
		document._ajaxC=0; document._ajaxA=[];
	} document._ajaxC++;
		document._ajaxA[ak]=(new Date()).asDateTimeStringYYMMDD();
//console.log(sprintf('post(1)=%1.3f',(new Date()).getTime()/1000));
	var focusedEl=Ext.focusedEl(),
		unhhf=null, aborting=false,
	req = Ext.Ajax.request({
		url: url, 
	// params надо захешить ... иначе вложенные данные не передаются :(
		params:hash2query(params),
	// method:'POST', ... по умолчанию
	success: function(response){ // расшифруем ответ сервера
		if (document._ajaxDebug) console.logDt(sprintf(
			'ajax(%s,%1.3f sec): %s',url, ((new Date()).getTime()-started)/1000, func_name));
//console.log(sprintf('post(2)=%1.3f',(new Date()).getTime()/1000));
		var
			resp = (String)(response.responseText), resp_js,
		tryFun=function(jsonText, onSuccess){ // #26107 вместо try/catch
			onSuccess(JSON.parse(jsonText)); }; // try ведет к утечке памяти!!
		if (unhhf) // контроль перезагрузки док-та (уберем обработчик)
			window.removeEventListener('beforeunload', unhhf, false);
			document._ajaxC--; delete document._ajaxA[ak];
		tm(100,function(){ // ошибка, если не прошел JSON.parse()
			if (resp_js) return; M2.hideStatusWin();
			if (focusedEl && focusedEl.focus instanceof Function) focusedEl.focus();
			if (!aborting) ajax_error(error_func,resp); });
		tryFun(resp, function(v){
			resp_js=v; if (success_func) success_func(resp_js); 
		});
/*
// #26107 умечка памяти!!
		try {
//console.log(sprintf('post(3)=%1.3f',(new Date()).getTime()/1000));
			resp_js = eval('('+resp+')');
//console.log(sprintf('post(4)=%1.3f',(new Date()).getTime()/1000));
		} catch (e) {
			M2.hideStatusWin();
				if (focusedEl && focusedEl.focus instanceof Function) focusedEl.focus();
			if (!aborting) ajax_error(error_func,resp);
			return;
		}
		if (success_func) success_func(resp_js);
*/
	},
	failure: function(response, opts){ //window.setTimeout(function(){
		console.logDt(sprintf( // if (document._ajaxDebug) 
			'ajax(%s,%1.3f sec): FAIL %s',url, ((new Date()).getTime()-started)/1000, func_name));
	// контроль перезагрузки док-та (уберем обработчик)
		if (unhhf) window.removeEventListener('beforeunload', unhhf, false);
		document._ajaxC--; delete document._ajaxA[ak];
	// если док-т перегружается - это не ошибка!
		if (aborting) return;
			m2_hide_status_win();
			if (focusedEl && focusedEl.focus instanceof Function) focusedEl.focus();
		if (error_func) error_func(
			'm2_Ext_Ajax: Ошибка выполнения запроса к серверу ('+response.statusText+')!',response); 
		else alert2(
			'm2_Ext_Ajax: Ошибка выполнения запроса к серверу ('+response.statusText+')!'); 
	// ошику проверяем с задержкой ... чтобы успели все обрадотчики unload сработать
		//},250);
	}});
		if (document._ajaxDebug) console.logDt(sprintf('ajax(%s, start): %s',url, func_name));
// контроль перезагрузки док-та (установим обработчик)
	unhhf = function(){
		if (unhhf) window.removeEventListener('beforeunload', unhhf, false);
		if (!aborting) console.log('m2_Ext_Ajax() aborting: '+url);
		aborting=true; 
	};
	window.addEventListener('beforeunload', unhhf, false);
	
//console.log(sprintf('post(x)=%1.3f',(new Date()).getTime()/1000));
	return req;
}

// Здесь в ответе всегда ожидаем объект вида
// {
//		success: true | false,
// 		message?: string,
//		result?: any
// }
// Если пришло success === false, то отобразим ошибку, иначе вернём полезную нагрузку result
function execAjax(func_name,params,success_func,url,error_func) {
	m2_Ext_Ajax(func_name,params,function (resp) {
		if (!resp.success) {
			m2_hide_status_win();
			alert2(resp.message);
		} else if (success_func instanceof Function) {
			success_func(resp.result);
		} else m2_hide_status_win();
	},url,error_func);
}



// --------------------------------------
// запрос к backend на выборку данных для JsonStore
//		jsonStore	- какой Store будем обновлять
function m2_Ext_LoadJsonStore(jsonStore,func_name,params,success_func,url)
{
	m2_Ext_Ajax(func_name,params,function(resp_js){
		if (
			resp_js.metaData && resp_js[resp_js.metaData.root]
		) jsonStore.loadData(resp_js);
		if (success_func) success_func(resp_js);
	},url);
}

// --------------------------------------
// скрыть/показать колонку в таблице
function m2_Ext_dbg_set_col_visible(dbg,field_name,visible)
{
	xg(dbg).getColumnModel().setHidden(
		xg(dbg).getColumnModel().findColumnIndex(field_name),
		!visible);
}

// --------------------------------------
// сообщить "нет данных"
function m2_Ext_dbg_no_data(dbg,text,color)
{
	var 
		se=xg(dbg).searcher;
	if (se) {
		se.noData(text,color); return;
	}
// для гридов без searcher...
	if (
		xg(dbg).getStore() && xg(dbg).getStore().getCount()>0
	) return;
		if (!text) text="нет данных";
		if (color) color='style="color:'+color+';"'; else color='';
	window.setTimeout(function(){
		if (
			xg(dbg) && xg(dbg).view && xg(dbg).view.mainBody
		) xg(dbg).view.mainBody.update(
			'<div class="x-grid-empty" '+color+'>'+text+'</div>');
		},50);
}

function m2_date_convert_YYYYMMDD_to_ISO(v,record)
{
	var d = new Date();
	d.fromDateTimeStringYYMMDD(v);
	return d;
}

// --------------------------------------------------------------------
//  сообщалка
Ext.notifyer = function(){
    var msgCt;
    function createBox(t, s){
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    }
    return {
        msg : function(title, text, timeout){
			var k=sprintf('%s|%s',title,text); // уже отображается?
				if (document._Ext_notifyer_text==k) return;
			document._Ext_notifyer_text=k; 
				if (!timeout) timeout=1;
			window.setTimeout(function(){
				document._Ext_notifyer_text=null;},timeout*1000)
            var m = Ext.DomHelper.append(
				msgCt, {html:createBox(title, text)}, true);
			msgCt.alignTo(document.body, 't-t');
            m.slideIn('t').pause(timeout).ghost("t", {remove:true});
        },
        init : function(){
            var lb = Ext.get('lib-bar');
            if(lb){
                lb.show();
            }
			msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
			msgCt.alignTo(document.body, 't-t');
        }
    };
}(); Ext.onReady(Ext.notifyer.init, Ext.notifyer);

// --------------------------------------------------------------------
// --------------------------------------------------------------------
//
//   класс = поисковая машина + управление гридом с клавы + еще много вкусного
//
function M2_EXT_SEARCHER_GRID(conf)
{

/*
----------------------------------
описание комфигурашки conf = {
* - обязательные поля!
	searcher:'',	// *ID элемента (textfield) строки поиска (д/б конф. = enableKeyEvents:true)
	dbg:'',			// *ID элемента grid'a в который будем грузить данные
	minSearchLen: 3,	// минимальное кол-во символов для поиска

	local_data:{},	// *данные для загрузки в grid, локального поиска, изменения
	data_change:function(){},	// функция, которая вызывается при смене фокуса грида

	search_delay:150,	// задержка перед поиском
	search_fields:'',		// поля для локального поиска (игнорируются, если есть remote_search_func)
	default_column:1,		// номер колонки, выделяемый по-умолчанию
	tab_focus:'',	// ID элемента, на который должен перейти фокус при нажатии TAB (если не указан - событие просто "проглатывается")

	deny_auto_focus:1,	// не фокусировать searcher (для работы на планшетах)
	no_focus:true, //не фокусировать grid (для отображения групп в collapsed, при использовании Ext.grid.GroupingView)

	dropEscAll:false, // #20962 сбрасывать поиск полностью

	numpad_auto_edit_field:'QUA'// поле для "авто-редактирования" в стиле "reqsys"
				// при нажатии на numpad:0-9 или minus значение поля
				// изменятся и вызывается editor(...new_value)
	on_numpad_auto_edit: 	// вызвать вместо numpad_auto_edit()
		function(el,e){},		//	... например для редактирования в другом гриде
	editor_can:function(se,fn,action){},					// функция для определения возможности редактировния
	editor:function(se,fn,auto,value,cellEdit){},	// функция для вывода диалога редактора
	editor_ins:function(se,fn){},					// функция для ввода новой строки данных
	editor_del:function(se,fn){},					// функция для удаления строки данных

	dblClick:function(se,fn){},						// функция при двойном клике, вместо editor()

	filter_fn:function(record,id){return true;} // дополнительный фильтр данных

	remote_search_func:'',		// имя функции сервера для удаленного поиска
	remote_search_url:null,		// url для вызова функции
	remote_ext_params:{},		// доп. параметры для функции поиска
	on_get_remote_ext_params:function(){}	// динамические доп. параметры для функции поиска

	key_fields:'',		// ключевые поля (по ним призводится поиск данных для изменения и пр.)
	skip_key_fields:'',	// ключевые поля, которые можно пропустить при подстановке данных в удаленный dataset
	data_fields:'',		// поля для подстановки в поисковую таблицу при удаленном поиске
	on_calc_fields:function(){},	// функция для рассчета вычисляемых полей

	on_start_locator:function(){},	// событие при запуске поиска (можно оторбазить доп. колонки)
	on_finish_locator:function(){},	// событие после поиска (сделать че-то если ниче не найдено)
	on_apply_remote_data:function(){},	// событие после удаленного поиска (сообщить о превышении макс. строк и пр)
	after_drop_locator:function(){},// событие после сброса поиска - обычно для закрытия окна
	on_drop_locator:function(){		// событие при сброе поиска (скрыть доп. колонки)
		m2_Ext_dbg_set_col_visible('dbg','STOCK_QUA',false);}
	};

	getChkImg: function(data,row,col) {},		// получить имя картинки для галки
	onCheckClick: function(se,fn){},				// клик на галке ... обычно совпадает с edit()

----------------------------------
пример использования:

// организовать редактируемый грид

	// сначала разрушим предидущую версию класса
		if (document.se) {
			document.se.destroy(); delete document.se;
		}
	// новый экземпляр класса
		document.se = new M2_EXT_SEARCHER_GRID({
			searcher:'eSearcher', 
			dbg:'dbg', 
			local_data:document.doc_data.lines,

// номер колонки грида, выделяемый по-умолчанию (индекс начинаеися с 0)
	default_column:1,

// назначение полей данных
	key_fields:'ITEM_ID,SUPNO',	// по ним ищем
	data_fields:'QUA,SUMMA',	// их копируем при поиске на сервере

// доступ на редактирование
	editor_can:	function(searcher,fn,action) { 
		return !document.readonly;
	},

// функции редактирования данных
	editor:	function(searcher,fn,auto,value) { 
			// fn - поле которое редактируем
			// auto - ввод кол-ва сканером
			// value - значение полученное из встроенного редактора (editor-grid)
		var qua=parseFloat(searcher.selected.data.QUA);
		if (document.readonly) return;
	// авто-редактор (сканер)
		if (auto) {
			if (xg('dbg').getStore().getCount()==1) {
				if (qua<searcher.selected.data.STOCK_QUA) {
					searcher.selected.data.QUA=qua+1;
					document.modifyed=true;
					searcher.save_row();
					searcher.drop_locator();
					return;
				}
			} else {
				return;
			}
		}
	// ручной редактор
		if (qua<1) qua=1; qua=prompt('Кол-во',qua);
			if (qua==undefined) { searcher.restore(); return; }
		if ((String)(qua).length>5) {
			alert('Не верное кол-во!'); return;
		}
		searcher.selected.data.QUA = parseFloat(qua);
		document.modifyed=true;
		searcher.save_row(); // это можно делать асинхронно!
	},
	editor_del:function(searcher,fn) { 
			// fn - поле которое редактируем
		if (document.readonly) return;
		// может стоит спросить удалять или нет?
		searcher.selected.data.QUA = 0;
		document.modifyed=true;
		searcher.save_row();
	},
	on_calc_fields:function(data){
		data.SUMMA = 
			parseFloat(data.QUA)*parseFloat(data.PRICE);
	},

// поиск на клиенте (не рабоатет, если указан поиск на сервере)
	search_fields:'PRODUCT_NAME,PRICE,SUMMA',

// поиск на сервере - имя функции сервера, для поиска ей передается параметр (query='text')
	remote_search_func:'search_for_items',

// доп. параметры при поиске
	on_get_remote_ext_params = function(){ return {
		req_type:document.doc_data.header.REQ_TYPE,
		want_resmo:document.doc_data.header.REQ_TYPE==3?1:0
	};}

// можно использовать конструкцию вида 
//		xg('dbg').searcher.use_remote_search=true/false;
// для вкл./выкл. удаленного приска без перестройки грида

// события при начале/окончании поиска
	on_start_locator:function(){
		xg('dbg').getColumnModel().setHidden(
			xg('dbg').getColumnModel().findColumnIndex('STOCK_QUA'),
		// скрыть лишние колонки
			false);
	},
	on_drop_locator:function(){
		xg('dbg').getColumnModel().setHidden(
			xg('dbg').getColumnModel().findColumnIndex('STOCK_QUA'),
		// отобразить колонку с остатком
			true);
	},
// куда передавать фокус по кл.TAB?
	tab_focus:'bDH_save'

		});

// ----- работа после инициализации:

// выполнить поиск
	document.se.search('но-шпа 8');

// восстановить фокус грида
	document.se.restore();

// изменить набор полей для локального поиска
	document.se.set_searchfields("TYPE_NAME,DOCNO");

// "симуляция" поиска
	document.se.simulate_remote_locator(text,data)

// восстановить способность принимать фокус (восстановить стили)
	document.se.canFocusRestore(); // unselectable? unfocusable?

*/

// данные текущей строки (для редактирования)... доступны снаружи класса
this.selected = {
	row:-1, 
	col:-1, 
	data:{}
};

this.noData = function(text,color) {
	if (
		xg(conf.dbg).getStore() && xg(conf.dbg).getStore().getCount()>0
	) return;
		if (!text) text="нет данных";
		if (color) color='style="color:'+color+';"'; else color='';
	window.setTimeout(function(){
		if (
			xg(conf.dbg) && xg(conf.dbg).view && xg(conf.dbg).view.mainBody
		) xg(conf.dbg).view.mainBody.update(
			'<div class="x-grid-empty" '+color+'>'+text+'</div>');
		},50);
}

// #21059 сохранить порядок и видимость колонок >> JSON
this.colsSave = function(onSaveCol){
	var 
		dbg=xg(conf.dbg), resp=[];
	dbg.getColumnModel().columns.forEach(function(col){
		var rec={
			visible:col.hidden?0:1,
			width:col.width?col.width:0,
				header:col.header?col.header:'',
				tooltip:col.tooltip?col.tooltip:'',
			dataIndex:col.dataIndex, };
		if (onSaveCol instanceof Function) 
			onSaveCol(dbg.searcher,col,rec); // сохранить еще чего-нибудь?
		resp.push(rec); 
	});
	return resp;
}

// #21059 восстановить порядок и видимость колонок
this.colsRestore = function(cols){
	var colOrder=[],
		cm=xg(conf.dbg).getColumnModel();
// сначала видимость и ширина
	cols.forEach(function(col){
		var
			coli=cm.findColumnIndex(col.dataIndex);
			if (coli<0) return;
		cm.setHidden(coli, !col.visible);
			if (col.width) cm.setColumnWidth(coli, col.width);
		colOrder.push(col.dataIndex);
	});
// порядок следования
	var ok=0; while (!ok) { ok=1;
		for(var i=0; i<colOrder.length; i++) {
			var
				coli=cm.findColumnIndex(colOrder[i]);
			if (coli<0) {
		//console.log('cm.moveColumn:: '+colOrder[i]+' not found!');
				continue; }
			if (coli!=i) {
		//console.log(sprintf('cm.moveColumn(%d,%d)',coli,i));
				cm.moveColumn(coli,i); ok=0; break; }
		}
	}
}

// -------------------------------------
// приватные функции

var _data_change = function(row,col)
{
	var
		me = xg(conf.dbg).searcher,
		record = xg(conf.dbg).getStore().getAt(row);
	me.selected.row = row;
		me.selected.col = col;
	if (record) me.selected.data = record.data; 
		else me.selected.data=false;
	if (conf.data_change) conf.data_change(
		me.selected.data, me.selected.row, me.selected.col, me);
}

// выделение ячейки грида + движение по нему
this.focus_cell = function(row,col)
{
	var s='', me = xg(conf.dbg).searcher;
		if (!row) row=0; if (!col) col=0;
	s=(String)(row).trim(); if (s.length>1 && (
		s.substring(0,1)=='+' || s.substring(0,1)=='-'
	)) {
		_focus_cell(parseInt(row),parseInt(col));
	} else {
		me.selected.row=0; me.selected.col=0;
		_focus_cell(parseInt(row),parseInt(col));
	}
}
var _focus_cell = function(move_row,move_col)
{
	var
		me = xg(conf.dbg).searcher,
		store = xg(conf.dbg).getStore();

// пытаемся найти ту же запись (если указаны ключевые поля) ...
	if (move_row==undefined) {
		me.selected.row=_search_record_index(me.selected.data,me,store,false);
		move_row=0;
	}
	if (move_col==undefined) {
		if (conf.default_column) me.selected.col=parseInt(conf.default_column);
		move_col=0;
	}

// проверим доступные диапазоны ячеек
	me.selected.row = me.selected.row+move_row;
	if (me.selected.row<0) 
		me.selected.row=0; 
	if (me.selected.row>=xg(conf.dbg).getStore().getCount()-1) 
		me.selected.row=xg(conf.dbg).getStore().getCount()-1;
	me.selected.col = me.selected.col+move_col;
	if (me.selected.col<0) 
		me.selected.col=0; 
	if (me.selected.col>=xg(conf.dbg).getColumnModel().columns.length-1) 
		me.selected.col=xg(conf.dbg).getColumnModel().columns.length-1;

// пропуск скрытых колонок
	if (
		xg(conf.dbg).getColumnModel().isHidden(me.selected.col)
	) {
		if (move_col>0)	{
			while (
				me.selected.col<=xg(conf.dbg).getColumnModel().columns.length-1 &&
				xg(conf.dbg).getColumnModel().isHidden(me.selected.col)
			) {
				me.selected.col++;
			}
			if (
				me.selected.col>xg(conf.dbg).getColumnModel().columns.length-1 ||
				xg(conf.dbg).getColumnModel().isHidden(me.selected.col)
			) {
				me.selected.col=xg(conf.dbg).getColumnModel().columns.length-1;
				while (
					xg(conf.dbg).getColumnModel().isHidden(me.selected.col) &&
					me.selected.col>0
				) {
					me.selected.col--;
				}
			}
		} else {
			while (
				me.selected.col>=0 &&
				xg(conf.dbg).getColumnModel().isHidden(me.selected.col) 
			) {
				me.selected.col--;
			}
			if (
				me.selected.col<0
			) {
				me.selected.col=0;
				while (
					xg(conf.dbg).getColumnModel().isHidden(me.selected.col) &&
					me.selected.col<xg(conf.dbg).getColumnModel().columns.length-1
				) {
					me.selected.col++;
				}
			}
		}
	}
	
// таблица пуста!
	if (me.selected.row<0) {
		_data_change(me.selected.row, me.selected.col);
		return;
	}

// выделяем ячейку		
	if (xg(conf.dbg)._rendered) {
	// способ обойти потерю фокуса грида при использовании BufferView
		window.setTimeout(function(){
			var sm=xg(conf.dbg).getSelectionModel();
				if (!me || !me.selected || !sm) return;
			if (sm.select instanceof Function) sm.select(
				me.selected.row, me.selected.col, 	// т.к. bufferView рисует таблицу не сразу, а по таймауту
				false, true);	// еще есть проблема в extJs ... ensureVisible() иногда вылетает с ошибкой?!
			else sm.selectRow(
				me.selected.row,false,false);
		},150); // надо поставить сей блок+timeout перед  ensureVisible()
		xg(conf.dbg).getView().ensureVisible(
			me.selected.row, me.selected.col, 
			false // не двигать колонки ... иначе 100% ошибка в extJs.resolveCell()
		);
	}

// шлем событие изменения данных
	_data_change(me.selected.row, me.selected.col);
}

// вычислить кол-во видимых строк грида
var _visible_row_count = function(){
	var rh=0, 
		view = xg(conf.dbg).getView();
	if (view.getCalculatedRowHeight) {
	// если view имеет функцию вычисления высоты (BufferView)
		rh = view.getCalculatedRowHeight()+1;
	}
	if (rh<1) rh=21; // высота строки по умолчанию = 21
// кол-во строк - высота на высоту строки
	return parseInt(view.scroller.getHeight()/rh);
}

// -------------------------------------
// управление данными

// подставить локальные данные в выборку при удаленном поиске
var _replace_with_local_data = function(remote_data){
	if (!conf.key_fields || !conf.data_fields) return -1;

	var ff=[], s='', ss='', di=-1, data_rec=[],
		store = xg(conf.dbg).getStore(),
		me = xg(conf.dbg).searcher;

// собрать массив полей данных
	if (!me._data_fields) {
		s = (String)(conf.data_fields); s = s.split(',');
		for (i in s) {
			if (s[i] instanceof Function) continue;
			ss=(String)(s[i]);
			ff[ff.length]=ss.trim();
		}
		me._data_fields=ff;
	}
	ff=me._data_fields;

// для всех строк данных поступивших от сервера - ищем в данные в локальном наборе
	for(var i in remote_data) {
		if (remote_data[i] instanceof Function) continue;
		di = _search_record_index(remote_data[i],me,store,true,true);
		if (di<0) continue;
	// нашли локальную запись ... заменим поля данных
		for(var ii in ff) {
			if (ff[ii] instanceof Function) continue;
			remote_data[i][ff[ii]] = conf.local_data.data[di][ff[ii]];
		}
	// + skip_key_fields
		if (me._skip_key_fields) for(var ii in me._skip_key_fields) {
			if (me._skip_key_fields[ii] instanceof Function) continue;
			if (!me._skip_key_fields[ii]) continue;
			remote_data[i][ii] = conf.local_data.data[di][ii];
		}
	}
}

// найти индекс строки в local_data или текущих (возможно фильтрованных) данных
var _search_record_index = function(search_data,me,store,in_src_data,can_skip){
	if (!conf.key_fields) return -1;
	if (!search_data) return -1;
//	if (search_data.length<2) return -1;
	var ff=[], s='', ss='', i, ii, data_rec=[],
		found=false, index=-1;

// собрать массив ключевых полей
	if (!me._key_fields) {
		s = (String)(conf.key_fields); s = s.split(',');
		for (i in s) {
			if (s[i] instanceof Function) continue;
			ss=(String)(s[i]);
			ff[ff.length]=ss.trim();
		}
		me._key_fields=ff;
	}

// ключевые поля, которые можно "пропустить" при поиске
	if (
		can_skip && !me._skip_key_fields && conf.skip_key_fields
	) {
		s = (String)(conf.skip_key_fields); s = s.split(',');
		me._skip_key_fields = {};
		for (i in s) {
			if (s[i] instanceof Function) continue;
			ss=(String)(s[i]);
			me._skip_key_fields[ss.trim()]=true;
		}
	}
	
// ищем запись в наборе данных (по ключевым полям)

	ff=me._key_fields; if (in_src_data) {
	// поиск в исходных данных
		i=0; while (i<conf.local_data.data.length) {
			data_rec = conf.local_data.data[i];
				if (data_rec instanceof Function) continue;
			found=true; 	
			for(var ii in ff) {
				if (ff[ii] instanceof Function) continue;
				found = found && (
					((String)(search_data[ff[ii]]) == (String)(data_rec[ff[ii]])) 
						|| 
					(can_skip && me._skip_key_fields && me._skip_key_fields[ff[ii]])
				);
				if (!found) break;
			} 
			if (found) { index=i; break; }
			i++;
		}
	} else {

	// поиск в текущих (фильтрованных) данных грида
		i=0; while (i<store.getCount()) {
			data_rec = store.getAt(i).data;
				found=true;	
			for(var ii in ff) {
				if (ff[ii] instanceof Function) continue;
				found = found && (
					(String)(search_data[ff[ii]]) == (String)(data_rec[ff[ii]])
				);
				if (!found) break;
			} 
			if (found) { index=i; break; }
			i++;
		}
	}

	return parseInt(index);
}


// -------------------------------------
// фильтры

// функция локального фильтрования
var _filter_fn = function(me,record,id){
	var ok=true, s, data_rec, search_text,
		ff = me._search_fields;
// data_rec - строка данных в которой ищем
	data_rec=''; for (var i in ff) {
		if (ff[i] instanceof Function) continue;
		data_rec = data_rec + ' ' + 
			(String)(record.data[ff[i]]).trim().toLowerCase();
	}
// ищем все слова в ss
	search_text = me._filter_text;
	search_text = search_text.split(' ');
	for (var i in search_text) {
		if (search_text[i] instanceof Function) continue;
		s=(String)(search_text[i]);
		if (s.length<1) continue;
			s=str_replace('_',' ',s);
		ok = ok && data_rec.indexOf(s)>=0;
		if (!ok) break;
	}
// 
	return ok;
}

// отбрасываем последнее слово в фильтре
var _drop_last_token = function(){
	var s='', ss='', t=[], i,
		sea = xg(conf.searcher),
		me = xg(conf.dbg).searcher;
	s = (String)(sea.getValue()).trim();
		s = s.split(' ');
	i=0; while(i<s.length) {
		if (i>s.length-2) break; // отбосим последний
		ss = (String)(s[i]).trim();	i++;
		if (ss.length<1) continue;
		t[t.length] = ss;
	}
	if (t.length<1) {
		me.drop_locator(); 
	} else {
		s = t.join(' ')+' '; 
		window.setTimeout(function(){sea.setValue(s);},25);
		me._apply_locator();
	}
}

// полный сброс фильтра
this.drop_locator = function(force_reload){
	var 
		me = xg(conf.dbg).searcher;
	if (me._remote_se_in_progress) { //  && !force_reload
//console.log('drop_locator(): ');
		if (!me._remote_se_in_progress_tm) {
//console.log('  Ext.notifyer.msg()');
	Ext.notifyer.msg(
			'<span style="color:maroon;font-weight:bold;">Предупреждение</span>', 
			'Идет поиск на сервере ... #14843<br>'+
			'Дождитесь окончания поиска!', 5);
				xg(conf.searcher).getEl().dom.style.background='red';
			window.setTimeout(function(){
					me._remote_se_in_progress_tm=0;},5500);
			me._remote_se_in_progress_tm=1;
		} return; 
	}
		me._filter_text='';
	//	if (!xg(conf.searcher)) return;
		xg(conf.searcher).max_row_exceeded=false;
	if (me._filter_tm) clearTimeout(me._filter_tm);
		window.setTimeout(function(){
			if (!xg(conf.searcher).getEl()) return;
		//	xg(conf.searcher).getEl().dom.style.backgroundColor='white';
			xg(conf.searcher).getEl().dom.readOnly=false;
		//	xg(conf.searcher).setValue('');
		},25);
	if (conf.on_drop_locator) conf.on_drop_locator(me);
		xg(conf.dbg).getStore().clearFilter();
		xg(conf.searcher).reset(); // setValue('');
	if (me._remote_filter || force_reload)
		xg(conf.dbg).getStore().loadData(conf.local_data);
	if (conf.filter_fn) xg(conf.dbg).getStore().filterBy(conf.filter_fn);
// выставить курсор (найти нашу запись и отобразить ее) ...
	window.setTimeout(function(){
		if (!conf.no_focus) _focus_cell();
	},100);
}

// симуляция удаленного поиска (подстановка данных в грид + searcher)
this.drop_simulate_remote_locator = function(){
	var me = xg(conf.dbg).searcher;
		me._simulate_rsde=false;
		me._simulate_rsd=false;
	xg(conf.searcher).getEl().dom.style.backgroundColor='white';
	me.drop_locator(true);
}

this.simulate_remote_locator = function(text,data){
	var me = xg(conf.dbg).searcher;
		me._simulate_rsd=true;
		//console.log('simulate-search');
	if (me._filter_tm) {
		window.clearTimeout(me._filter_tm);
		me._filter_tm=false;
	}
		if (!text) { text='';
			me._simulate_rsde=	// позволять поиск в выбранных данных!
				!(!conf.search_fields);  // но только если есть поля для поиска
		} else me._simulate_rsde=false;
	window.setTimeout(function(){
		xg(conf.searcher).setValue(text);
		me._filter_text=text;
	},250); 
		me._apply_remote_data(data);
	me.focus_cell(0,me.selected.col); // чтобы вызвать data_change
}

// установить данные удаленного поиска (при поиске и прямой подстановке данных)
this._apply_remote_data = function(resp_js){
	var me = xg(conf.dbg).searcher;
		if (xg(conf.dbg)._tmRe) {
			window.clearTimeout(xg(conf.dbg)._tmRe);
			xg(conf.dbg)._tmRe=null;
		}
		xg(conf.searcher).max_row_exceeded=false;
// изменим цвет поисковой строки
	window.setTimeout(function(){
		xg(conf.searcher).getEl().dom.readOnly=false;
		if (conf.on_apply_remote_data instanceof Function)
			conf.on_apply_remote_data(resp_js);
	// превышено макс. кол-во строк?
		if (resp_js.max_row_exceeded) {
			xg(conf.searcher).max_row_exceeded=resp_js.max_row_exceeded;
			xg(conf.searcher).getEl().dom.style.background='#FF8080';
			if (!resp_js.data || resp_js.data.length<1)
				m2_Ext_dbg_no_data(conf.dbg,resp_js.max_row_exceeded,'red');
			else xg(conf.dbg)._tmRe=window.setTimeout(function(){
				Ext.notifyer.msg(
					'<span style="color:maroon;font-weight:bold;">Предупреждение</span>', 
					resp_js.max_row_exceeded, 5);
				xg(conf.dbg)._tmRe=null;
			},2000);
		} else {
			if (xg(conf.searcher).getValue())
				xg(conf.searcher).getEl().dom.style.background='yellow';
		}
		//xg(conf.searcher).getEl().dom.style.backgroundImage='';
	},25);
// не верные данные от backend?
	if (!(
		resp_js.metaData && resp_js[resp_js.metaData.root]
	)) {
		xg(conf.dbg).getStore().removeAll();
		m2_Ext_dbg_no_data(conf.dbg,'данные не найдены','blue');
		if (conf.on_finish_locator) conf.on_finish_locator(me);
		return;
	}
// надо подставить локальные данные в выборку
	_replace_with_local_data(resp_js.data);
	me._remote_filter=resp_js;
// перегружаем грид
	xg(conf.dbg).getStore().loadData(resp_js);
		if (conf.filter_fn) xg(conf.dbg).getStore().filterBy(conf.filter_fn);
	if (resp_js.data && resp_js.data.length<1)
		m2_Ext_dbg_no_data(conf.dbg,'ничего не найдено','blue');
// после поиска ...
	if (conf.on_finish_locator) conf.on_finish_locator(me);
}

// программно вызвать поиск
this.search = function(text,force){
	text=text.trim()+' ';
		xg(conf.searcher).setValue(text);
	window.setTimeout(function(){
		xg(conf.searcher).getEl().dom.selectionStart=text.length; },75);
	if (force)
		xg(conf.dbg).searcher._filter_text=false;
	this._apply_locator();
}

// применить фильтр (вызывается по событию "valid")
this._apply_locator = function(){
	var s='',
		sea = xg(conf.searcher),
		me = xg(conf.dbg).searcher;
	s = (String)(sea.getValue()).trim();
		if (!conf.minSearchLen) conf.minSearchLen=3;
	if (s.length<conf.minSearchLen) return;

//console.logDt('start_apply_locator(local)');

// ищется тот же самый текст?
	s=s.toLowerCase();
	if (me._filter_text==s) return; // зачем его искать?
	me._filter_text=s;

// симуляция поиска?
	if (
		me._simulate_rsd && !me._simulate_rsde
	) {
		me._simulate_rsd=false; 
		//console.log('stop-search');
		return;
	}
	//console.log('search');

// поиск - по timeout
	if (me._filter_tm) 
		clearTimeout(me._filter_tm);
	if (me._remote_se_in_progress) {	// #14843 поиск в момент
		window.setTimeout(function(){	// пока поиск не завершен
			xg(conf.searcher).getEl().dom.style.background='red';
		},25); 
			console.log('try-retry-sea: '+me._remote_se_in_progress);
		me._remote_se_in_progress++; return;
	}

// удаленное фильтрование	
	if (
		conf.remote_search_func && 
		!me._simulate_rsde &&
		me.use_remote_search		// можно отключать!
	) {
		me._remote_filter=true;
//var stack = new Error().stack; console.log('remote_search!'); console.log( stack );
	// ищем ч/з 0.5сек. ... а зачем? ... valid то уже с задержкой!
		me._filter_tm = setTimeout(function(){
			// изменим цвет поисковой строки
				window.setTimeout(function(){
					xg(conf.searcher).getEl().dom.style.background='aqua';
//					xg(conf.searcher).getEl().dom.readOnly=true;
					//xg(conf.searcher).getEl().dom.style.backgroundImage='';
				},25);
			me._remote_se_in_progress=1; // #14843 начнем поиск ...
			var q={}, rsf=conf.remote_search_func;
				if (conf.remote_ext_params) q=conf.remote_ext_params;
				if (conf.on_get_remote_ext_params) q=conf.on_get_remote_ext_params();
			//q.timeout= 5*60*1000; // 5 мин на поиск?! ... это надо задавать в прикладном приложении!
				q.query = me._filter_text;
		// remote_search_func - собсвенная функция?
			if (!(rsf instanceof Function)) rsf=function(q, successFn, url, errorFn){
				m2_Ext_Ajax(conf.remote_search_func, q, successFn, url, errorFn); }
		// или m2_Ext_Ajax...
			rsf(q, function(resp_js){
				if (me._remote_se_in_progress>1) { // #14843 вызовем повторный поиск 
					me._filter_tm=false; me._filter_text='';
				console.log('retry-sea: '+me._remote_se_in_progress);
					me._remote_se_in_progress=0;	
					me._apply_locator(); return;		// по последней фразе
				}
					me._filter_tm=false;
					me._apply_remote_data(resp_js);
				if (conf.on_start_locator) conf.on_start_locator(me,me._kb_RETURN);
				me.restore(true);
			// тыкаем Enter ... если был
				if (me._kb_RETURN) {
					me._kb_RETURN=false; _focus_cell();
					if (
						conf.editor && me.selected && me.selected.data
						&& !me._filter_tm
					) {
						var fn = xg(conf.dbg).getColumnModel();
						if (fn) fn=fn.columns[me.selected.col].dataIndex;
						if (
							!conf.editor_can ||
							(conf.editor_can && conf.editor_can(me,fn,'edit-auto'))
						) conf.editor(me,fn,true);
					}
				}
				me._remote_se_in_progress=0; // #14843 поис завершен
				xg(conf.searcher).getEl().dom.style.background='aqua';
			},conf.remote_search_url,function(err){
				me._remote_se_in_progress=0; // #14843 при ошибке поиска
				alert2(err);
			});
		},conf.search_delay);
		return;
	}

// локальное фильтрование
	if (conf.search_fields) {
		me._remote_filter=false;
	// изменим цвет поисковой строки
		window.setTimeout(function(){
			if (!xg(conf.searcher).getEl() || !xg(conf.searcher).getEl().dom) return;
			xg(conf.searcher).getEl().dom.style.background='aqua';
//			xg(conf.searcher).getEl().dom.readOnly=true;
			//xg(conf.searcher).getEl().dom.style.backgroundImage='';
		},25);
	// список полей для поиска
		if (!me._search_fields) {
			var ff=[], ss='';
				s = (String)(conf.search_fields); 
				s = s.split(',');
			for (var i in s) {
				if (s[i] instanceof Function) continue;
				ss=(String)(s[i]);
				ff[ff.length]=ss.trim();
			}
			me._search_fields=ff;
		}
	// вызовем поиск ч/з 0.5сек.
//console.logDt('apply_locator(local)');
		me._filter_tm = setTimeout(function(){
			xg(conf.dbg).getStore().filterBy(function(record,id){
				var me = xg(conf.dbg).searcher;
				if (
					conf.filter_fn &&
					!conf.filter_fn(record,id)
				) return false;
				return _filter_fn(me,record,id);
			});
//console.logDt('filtered(local)');
		// изменим цвет поисковой строки
			me._filter_tm=false;
			window.setTimeout(function(){
				if (!xg(conf.searcher).getEl() || !xg(conf.searcher).getEl().dom) return;
				xg(conf.searcher).getEl().dom.style.background='yellow';
				xg(conf.searcher).getEl().dom.readOnly=false;
				//xg(conf.searcher).getEl().dom.style.backgroundImage='';
			},25);
			if (conf.on_start_locator) conf.on_start_locator(me,me._kb_RETURN);
			me.restore(true);
//console.logDt('restored(local)');
		// тыкаем Enter ... если был
			if (me._kb_RETURN) {
				me._kb_RETURN=false; _focus_cell();
				if (
					conf.editor && me.selected && me.selected.data
					&& !me._filter_tm
				) {
					var fn = xg(conf.dbg).getColumnModel();
					if (fn) fn=fn.columns[me.selected.col].dataIndex;
					if (
						!conf.editor_can ||
						(conf.editor_can && conf.editor_can(me,fn,'edit-auto'))
					) conf.editor(me,fn,true);
				}
			}
		// после поиска ...
//console.logDt('on_finish_locator(local)');
			if (conf.on_finish_locator) conf.on_finish_locator(me);
//console.logDt('sea-end(local)');
		},conf.search_delay);
		return;
	}
	
	alert2('Не указан ни один способ фильтрования! (search_fields/remote_search_func)');
}

this.set_searchfields = function(sf)
{
	var me = xg(conf.dbg).searcher;
		conf.search_fields=sf;
		me._search_fields=null;
	me.drop_locator();
}


// -------------------------------------
// поддержка функции редактора

// эту функцию должен вызвать диалог редактора при нажатии "Ok"
this.save_row = function(no_focus, canSkip)
{
	var di=-1, rec=null,
		me = xg(conf.dbg).searcher,
		store = xg(conf.dbg).getStore();
	if (!conf.key_fields) {
		alert2('conf.key_fields not set! can not work!'); return; }
// вычислить поля
	if (conf.on_calc_fields) conf.on_calc_fields(me.selected.data);

// #26699 защита от <script> и пр. атак
	var row=me.selected.data, 
		xssa=['<script', '<css', '<img', '<table'];
	for(var i in row) {
		if (row[i] instanceof Function) continue;
		var ok=1,
			s=(String)(row[i]).toLocaleLowerCase();
		xssa.forEach(function(chk){
			if (s.indexOf(chk)>=0) ok=0; });
		if (!ok) {
			console.log('XSS-check failed for: '+row[i]);
			row[i]='#26699 XSS attack!'; }
	}

// пишем данные в local_data
	di = _search_record_index(me.selected.data,me,store,true,canSkip);
//	console.log('saved row = '+di);
	if (di<0) {
	// новая строка
		conf.local_data.data[conf.local_data.data.length] = me.selected.data;
	} else {
	// заменяем строку
		conf.local_data.data[di] = me.selected.data;
	}
// пишем данные в текущий grid.store
	di = _search_record_index(me.selected.data,me,store,false);
	if (di<0) { // новая запись?
		xg(conf.dbg).getStore().loadData(conf.local_data);
		di = _search_record_index(me.selected.data,me,store,false);
	} rec = xg(conf.dbg).getStore().getAt(di); if (!rec) { 
		if (!no_focus) alert2('M2_EXT_SEARCHER_GRID int error!'); 
		return; }
	rec.data = me.selected.data; rec.commit();
// восстановим фокус и пр.
	if (!no_focus) me.restore(true);
}

// сохранить пачку строк, заменяя data_fields (остальные поля не трогаем)
this.save_rows = function(rows)
{
	var di=-1, rec=null, ndata={}, ff=[],
		me = xg(conf.dbg).searcher,
		store = xg(conf.dbg).getStore();
	if (!conf.key_fields) {
		alert2('conf.key_fields not set! can not work!'); return; }
	if (!conf.data_fields) {
		alert2('data_fields not set! can not work!'); return; }
// данные для сохранения
	if (me._data_fields) 
		ff=me._data_fields;
	else {
		s = (String)(conf.data_fields); s = s.split(',');
		for (i in s) {
			if (s[i] instanceof Function) continue;
			ss=(String)(s[i]);
			ff[ff.length]=ss.trim();
		} me._data_fields=ff; }
// по всем строкам ...
	rows.forEach(function(row){
		di = _search_record_index(row,me,store,true);
		if (di<0) {
			console.log('save_rows():: cant find row='+JSON.stringify(row));
			return; }
	// соберем новые данные
		ndata = conf.local_data.data[di];
		for(var i in ff) {
			if (ff[i] instanceof Function) continue;
			if (row[ff[i]]) ndata[ff[i]] = row[ff[i]]; }		
	// заменяем данные в строке
		conf.local_data.data[di] = ndata;
	// заменяем данные в гриде
		di = _search_record_index(ndata,me,store,false);
			rec = xg(conf.dbg).getStore().getAt(di); 
		if (!rec) { 
			console.log('save_rows():: cant find grid-row='+JSON.stringify(row));
			return; }
		rec.data = ndata; rec.commit();
	});
}

// удаление строки
this.delete_row = function(no_focus)
{
	this.remove_row(no_focus);
}
	
this.remove_row = function(no_focus,dont_alert_on_error)
{
	var di=-1, rec=null, 
		me = xg(conf.dbg).searcher,
		store = xg(conf.dbg).getStore();
	if (!conf.key_fields) {
		alert2('conf.key_fields not set! can not work!'); return;
	}
	var ls=false; if (me.selected && me.selected.row) ls={
		row: me.selected.row,
		col: me.selected.col
	};
// ищем данные в local_data
	di = _search_record_index(me.selected.data,me,store,true);
	if (di<0) {
		if (!dont_alert_on_error) alert2('Строка не найдена (data)?'); 
		return;
	} else {
		var new_data=[]; for(
			var i=0; i<conf.local_data.data.length; i++
		) if (i!=di) new_data[new_data.length]=conf.local_data.data[i];
		conf.local_data.data=new_data;
//		delete conf.local_data.data[di];
	}
// ищем данные в текущем grid.store
	di = _search_record_index(me.selected.data,me,store,false);
	rec = xg(conf.dbg).getStore().getAt(di);
	if (!rec) { 
		alert2('Строка не найдена (store)?'); return;
	}
	xg(conf.dbg).getStore().remove(rec);
// восстановим фокус и пр.
	if (!no_focus) {
		me.restore(true);
		if (ls) //window.setTimeout(function(){
			me.focus_cell(ls.row,ls.col);
		//	me.focus(); _on_focus();
		//},250);
	}
}

// эту функцию должен вызвать диалог (или кто угодно) для восстановления фокуса грида
this.restore = function(full)
{
//console.log(sprintf('m22::restore('+(full?'true':'false')+')=%1.3f',(new Date()).getTime()/1000));
	if (full) try {
	// перерисуем грид (иногда показывает пустые ячейки)
		if (xg(conf.dbg).getView()) xg(conf.dbg).getView().refresh();
	// выделяем текущую ячейку
		window.setTimeout(function(){_focus_cell();},100);
	} catch (e) {
		// Uncaught TypeError: Cannot call method 'stopEditing' of undefined
		// ... если гред не был отрисован
	}
	if (
		!xg(conf.dbg).searcher.conf.deny_auto_focus
		&& !isMobile() // #24275
	) {
//var stack = new Error().stack; console.log('restore.focus: '+conf.searcher); console.log( stack );
		xg(conf.searcher).focus();	// восстановим фокус
		_on_focus();				// и цвет
	}
}

// восстановить способность принимать фокус (восстановить стили)
this.canFocusRestore = function()
{
	var el=xg(conf.searcher).getEl().dom;
		el.style.mozUserSelect='text';		// бывает надо иногда ...
		el.style.khtmlUserSelect='text';
		el.style.webkitUserSelect='ignore';
}

// -------------------------------------
// события грида

// при клике ... или вообще при любой активации грида - восстановим фокус
this.restore_me = function() {
	// и все равно иногда форус теряется :(
	xg(conf.dbg).searcher.restore();
}

// при клике на гриде ... не всегда restore_me!
this.click = function() {
	if (xg(conf.dbg)._editorGrid_editing) return;
	xg(conf.dbg).searcher.restore();
}

// при клике на ячейку грида = событие conf.data_change
this.cell_click = function(grid, rowIndex, columnIndex, e) {
	if (xg(conf.dbg)._editorGrid_editing) return;
		_data_change(rowIndex,columnIndex);
	if (isMobile()) { // #24275
		var me = xg(conf.dbg).searcher; // попробуем открыть редактор
		me.cell_dbl_click(grid, rowIndex, columnIndex, e);
	} else if (!conf.deny_auto_focus) // #24275 (!mobile)
		xg(conf.searcher).focus();
}

// при двойном клике на ячейку грида - вызываем редактор
this.cell_dbl_click = function(grid, rowIndex, columnIndex, e) {
	var fn = xg(conf.dbg).getColumnModel();
	if (fn) fn=fn.columns[columnIndex].dataIndex;
// вызовем событие dblClick, если есть
	if (
		conf.dblClick instanceof Function &&
		xg(conf.dbg).searcher.selected &&
		xg(conf.dbg).searcher.selected.data
		&& !xg(conf.dbg).searcher._filter_tm
	) {
		conf.dblClick(xg(conf.dbg).searcher,fn);
		return; }
// editor-grid - встроенный редактор
	if (xg(conf.dbg).startEditing) {
		if (
			conf.editor_can && !conf.editor_can(xg(conf.dbg).searcher,fn,'edit-dblClick')
		) {
			window.setTimeout(function(){
				xg(conf.dbg).stopEditing();
			},100); // запрет (отмена) редактирования
		}
		return; // editor-grid - умеет все сам :)
	}
//cell_click(grid, rowIndex, columnIndex, e); ... незачем ... мешает!
	if (
		conf.editor instanceof Function && 
		xg(conf.dbg).searcher.selected &&
		xg(conf.dbg).searcher.selected.data
		&& !xg(conf.dbg).searcher._filter_tm
	) {
		if (
			!conf.editor_can ||
			(conf.editor_can && conf.editor_can(xg(conf.dbg).searcher,fn,'edit-dblClick'))
		) conf.editor(xg(conf.dbg).searcher,fn);
	}
}

// сохранение значений из встроенного редактора
this.validateedit = function(e){
	var me = xg(conf.dbg).searcher;
		if (!conf.editor) return;
		if (e.value==undefined) return;
	if (
		!conf.editor_can ||
		(conf.editor_can && conf.editor_can(me, e.field, 'edit-validate'))
	) conf.editor(me, e.field, false, e.value, true);
		e.cancel=true; // hide dirty record indicator && etc.
	window.setTimeout(function(){
		_focus_cell(0,parseInt(e.column)-me.selected.col);
	},25);
}

// событие при скрытии встроенного редактора
this.int_editor_hide = function(){
	window.setTimeout(function(){
		xg(conf.dbg).searcher.restore(true);
	},50);
}

// -------------------------------------
// см. события по клавишам строки поиска
this.searcher_keydown = function(el,e) {
	var me = xg(conf.dbg).searcher;
//console.logDt('searcher_keydown');

// выставим флаг "только что нажата кн."
	if (e.keyCode!=Ext.EventObject.RETURN) {
		me._kb_RETURN=false;
		if (me._kb_tm) {
			window.clearTimeout(me._kb_tm);
			me._kb_tm=null; 
		}
		me._kb_tm = window.setTimeout(function(){
			me._kb_tm=null;
		},100); // #22443 увеличил с 50
	}

// разрешим Ctrl+Enter и пр. (не будем обрабатывать)
	if (e.ctrlKey && (
		e.keyCode==Ext.EventObject.RETURN ||
		e.keyCode==Ext.EventObject.DOWN ||
		e.keyCode==Ext.EventObject.UP 
	)) return;

// авто-редактор числового поля (reqsys)
	if (
		conf.editor && 
			(conf.numpad_auto_edit_field || conf.on_numpad_auto_edit) &&
		!e.ctrlKey && !e.altKey && !e.shiftKey && (
		(
			e.keyCode>=Ext.EventObject.NUM_ZERO &&
			e.keyCode<=Ext.EventObject.NUM_NINE
		)
			|| e.keyCode==Ext.EventObject.NUM_MINUS
		)
	) { //console.log('numpad_auto_edit()');
		if (conf.on_numpad_auto_edit && // #19897
			conf.on_numpad_auto_edit instanceof Function) {
				conf.on_numpad_auto_edit(el,e); return; }
		//console.log("auto-edit");
		fn=conf.numpad_auto_edit_field;	if (
			!conf.editor_can ||
			(conf.editor_can && conf.editor_can(me,fn,'edit-numpad'))
		) {
			var x=(String)(me.selected.data[fn]).trim();
			if (e.keyCode==Ext.EventObject.NUM_MINUS)
				x=x.substring(0,x.length-1);
			else
				x=x+(String)(e.keyCode-Ext.EventObject.NUM_ZERO);
			conf.editor(me, fn, false, x);
		}
		e.stopEvent(); return; 
	}

// авто-редактор для editor-grid
	if (
		!conf.numpad_auto_edit_field &&	// не указано поле для авто-ввода
		conf.numpad_auto_edit_field!=false && // #20962 явный запрет для numPad
		xg(conf.dbg).startEditing &&	// grid = editorgrid
		!e.ctrlKey && !e.altKey && !e.shiftKey &&
		e.keyCode>=Ext.EventObject.NUM_ZERO &&
		e.keyCode<=Ext.EventObject.NUM_NINE
	) {
		if (conf.on_numpad_auto_edit && // #19897
			conf.on_numpad_auto_edit instanceof Function) {
				conf.on_numpad_auto_edit(el,e); return; }
		var me=xg(conf.dbg).searcher, 
			new_value=(String)(e.keyCode-Ext.EventObject.NUM_ZERO);
		if (
			xg(conf.dbg).colModel.getCellEditor(me.selected.col,me.selected.row)
		) {
		// если явно указанная колокна имеет редактор
			var fn = xg(conf.dbg).getColumnModel();
			if (fn) fn=fn.columns[me.selected.col].dataIndex;
			if (
				!conf.editor_can ||
				(conf.editor_can && conf.editor_can(me,fn,'edit-int'))
			) {
		// ... если редактироване разрешено
				xg(conf.dbg).startEditing(me.selected.row,me.selected.col);
				window.setTimeout(function(){
					xg(conf.dbg).colModel.getCellEditor(me.selected.col,me.selected.row)
						.setValue(new_value);
				},55);
			}
		} else
		if (conf._grid_editors) {
		// или откроем 1-ый по списку
			var fn = xg(conf.dbg).getColumnModel();
			if (fn) fn=fn.columns[conf._grid_editors[0].col].dataIndex;
			if (
				!conf.editor_can ||
				(conf.editor_can && conf.editor_can(me,fn,'edit'))
			) {
		// ... если редактироване разрешено
				xg(conf.dbg).startEditing(me.selected.row,conf._grid_editors[0].col);
				window.setTimeout(function(){
					conf._grid_editors[0].editor.setValue(new_value);
				},55);
			}
		}
		e.stopEvent();
		return; 
	}

// "проглотим" все наши события
	if (
		e.keyCode==Ext.EventObject.UP ||
		e.keyCode==Ext.EventObject.DOWN ||
		e.keyCode==Ext.EventObject.HOME ||
		e.keyCode==Ext.EventObject.END ||
		e.keyCode==Ext.EventObject.LEFT ||
		e.keyCode==Ext.EventObject.RIGHT ||
		e.keyCode==Ext.EventObject.PAGE_UP ||
		e.keyCode==Ext.EventObject.PAGE_DOWN ||
		e.keyCode==Ext.EventObject.ESC ||
		e.keyCode==Ext.EventObject.RETURN ||
		e.keyCode==Ext.EventObject.DELETE ||
		e.keyCode==Ext.EventObject.INSERT ||
		(e.keyCode==Ext.EventObject.TAB && !e.shiftKey)
	) {
		e.stopEvent();	// т.е. запретим действия по-умолчанию
	} else {
// #20962 отрицание (!) при двойном пробеле
		if (e.keyCode!=32) return;
		var
			s=xg(conf.searcher).getValue(); 
	// по позволяем сбрасывать (!) ... пусть давят "забой" для сброса
		if (
			s && s.length>1 && s[s.length-1]=='!'
		) {
			e.stopEvent(); return;
		}
	// выставить (!), если двойной пробел
		if (
			s && s.length>1 && s[s.length-1]==' '
		) {
			s=s.trim()+' !';
			xg(conf.searcher).setValue(s);
			e.stopEvent();
		} return;
	}

// управляем гридом (движение по таблице)
	if (e.keyCode==Ext.EventObject.UP) {_focus_cell(-1,0); return;}
	if (e.keyCode==Ext.EventObject.DOWN) {_focus_cell(1,0); return;}
	if (e.keyCode==Ext.EventObject.HOME) {
		if (e.ctrlKey) {
			_focus_cell(-xg(conf.dbg).getStore().getCount(),0); 
		} else {
			_focus_cell(0,-100); 
		}
		return;
	}
	if (e.keyCode==Ext.EventObject.END) {
		if (e.ctrlKey) {
			_focus_cell(xg(conf.dbg).getStore().getCount(),0); 
		} else {
			_focus_cell(0,100); 
		}
		return;
	}
	if (e.keyCode==Ext.EventObject.PAGE_DOWN) {
		_focus_cell(_visible_row_count(),0); 
	}
	if (e.keyCode==Ext.EventObject.PAGE_UP) {
		_focus_cell(-_visible_row_count(),0); 
	}
	if (e.keyCode==Ext.EventObject.LEFT) {_focus_cell(0,-1); return;}
	if (e.keyCode==Ext.EventObject.RIGHT) {_focus_cell(0,1); return;}

// переход на др. элемент формы (если указан)
	if (
		e.keyCode==Ext.EventObject.TAB 
		&& !e.shiftKey // Shift-TAB не обраратываем!
	) {
		if (conf.tab_focus) xg(conf.tab_focus).focus();
	// если не указан - просто проглотим событие, иначе ExtJS переводит фокус на грид
		return;
	}

// вызываем conf.editor() по кл. Enter
	if (e.keyCode==Ext.EventObject.RETURN) {
	// если только что нажата кн. - не делаем ничего!
		me._kb_RETURN=true; // выставим флаг "был нажат RETURN"
	// (надо при поиске сканером)
		if (me._kb_tm || me._remote_se_in_progress) return;  //#22443 не вызываем едитор пока идет запрос на сервер
	// права на редактирование
		var fn = xg(conf.dbg).getColumnModel();
		if (fn) fn=fn.columns[me.selected.col].dataIndex;
		if (conf.editor_can && !conf.editor_can(me,fn,'edit')) return;
	// editor-grid - откроем встроенный редактор
		if (xg(conf.dbg).startEditing) {
			if (
				xg(conf.dbg).colModel.getCellEditor(me.selected.col,me.selected.row)
			) {
				xg(conf.dbg).startEditing(me.selected.row,me.selected.col);
				return; // если явно указанная колокна имеет редактор
			} else
			if (conf._grid_editors) {
				xg(conf.dbg).startEditing(me.selected.row,conf._grid_editors[0].col);
				return; // или откроем 1-ый по списку
			}
		}
		
	// обычное редактирование
		if (
			conf.editor && 
			me.selected && me.selected.data
			&& !me._filter_tm
		) {
			var fn = xg(conf.dbg).getColumnModel();
			if (fn) fn=fn.columns[me.selected.col].dataIndex;
			conf.editor(me,fn);
		}
		return;
	}
	
// вызываем conf.editor_del() по кл. Del
	if (e.keyCode==Ext.EventObject.DELETE) {
		if (
			conf.editor_del && 
			me.selected && me.selected.data
			&& !me._filter_tm
		) {
			var fn = xg(conf.dbg).getColumnModel();
			if (fn) fn=fn.columns[me.selected.col].dataIndex;
		// права на редактирование
			if (conf.editor_can && !conf.editor_can(me,fn,'delete')) return;
			conf.editor_del(me,fn);
		}
		return;
	}

// вызываем conf.editor_ins() по кл. Ins
	if (e.keyCode==Ext.EventObject.INSERT) {
		if (
			conf.editor_ins
			&& !me._filter_tm
		) {
			var fn = xg(conf.dbg).getColumnModel();
			if (fn) fn=fn.columns[me.selected.col].dataIndex;
		// права на редактирование
			if (conf.editor_can && !conf.editor_can(me,fn,'insert')) return;
			conf.editor_ins(me,fn);
		}
		return;
	}

// сброс фильтра
	if (e.keyCode==Ext.EventObject.ESC) {
		var
			s = (String)(xg(conf.searcher).getValue()).trim();
		if (
			!me._filter_text || me._filter_text.length<1
			|| conf.dropEscAll // #20962 сброс поиска "сразу"
		) {
			me.focus_cell(0,0);
			xg(conf.searcher).getEl().dom.style.backgroundColor='white';
			xg(conf.searcher).getEl().dom.readOnly=false;
			xg(conf.searcher).getEl().dom.value='';
			if (me._filter_tm) clearTimeout(me._filter_tm);
			if (conf.after_drop_locator) conf.after_drop_locator(me);
		} else _drop_last_token();
		return;
	}
	
}

var _on_focus = function(){
	if (
		xg(conf.searcher) && xg(conf.searcher).getEl() &&
		xg(conf.searcher).getEl().dom
	) {
		if (xg(conf.searcher).max_row_exceeded)
			xg(conf.searcher).getEl().dom.style.background='#FF8080';
		else
			xg(conf.searcher).getEl().dom.style.background='white'; }
	if (isMobile()) { // #24275
		prompt2({ header:'Поиск', title:'Введите поисковую фразу',
			value:'', position:'top',
		onSuccess:function(s){
			var me = xg(conf.dbg).searcher;
			me.search(s,true);
		} }); return; }
	xg(conf.searcher)._focused=true;
	xg(conf.dbg)._editorGrid_editing=false;
};

var _on_blur = function(){
	if (
		xg(conf.searcher)._init &&
		xg(conf.searcher)._focused
	) return;
	if (
		xg(conf.searcher) && xg(conf.searcher).getEl() &&
		xg(conf.searcher).getEl().dom
	) xg(conf.searcher).getEl().dom.style.background='#e0e0e0';
	xg(conf.searcher)._focused=false;
};

// включение/выключение всех галок (data.SELECTED)
this.chckOnOff = function(
	on,					// значение (1,0 или др.) ... или функция для изменения значения
	fieldName,	// имя поля
	onSuccess,	// после выполения
	filterFn		// отбор по фильтру
) {
	if (!fieldName) fieldName='SELECTED';
	var dl=[], kfi=[], kf=(String)(conf.key_fields),
		store=xg(conf.dbg).getStore();

// данные о ключевых полях
	kf=kf.split(','); for (var i in kf) {
		if (kf[i] instanceof Function) continue;
		var ss=(String)(kf[i]);
		kfi[kfi.length]=ss.trim();
	}

// проставить в grid
	for(var i=0; i<store.getCount(); i++) {
		var 
			rec=store.getAt(i);
		if (
			filterFn && filterFn instanceof Function
			&& !filterFn(rec.data)
		) continue;
			if (on instanceof Function)
				on(rec);
			else {
				rec.data[fieldName]=on;
				rec.commit(); }
	// запомним какие данные надо обновить ...
		var k='k';
			for(var ii in kfi) {
				if (kfi[ii] instanceof Function) continue;
				k=k+'_'+rec.data[kfi[ii]];
			}
		dl[k]=rec.data;
	}

// проставить в data
	store=
		conf.local_data.data;
	for(var i=0; i<store.length; i++) for(var ii in dl) {
		if (dl[ii] instanceof Function) continue;
		var ki='k', kj='k';
			for(var j in kfi) {
				if (kfi[j] instanceof Function) continue;
				ki=ki+'_'+store[i][kfi[j]]; kj=kj+'_'+dl[ii][kfi[j]];
			}
		if (ki==kj) { // простое сравнение store[i].ID==dl[ii].ID не прокатит!
			store[i][fieldName]=on;
			dl[ii].found=1;
		}
	}

// добавим отсутствующие элементы
	for(var ii in dl) {
		if (dl[ii] instanceof Function) continue;
		if (!dl[ii].found) store[store.length]=dl[ii];
	}
	xg(conf.dbg).searcher.restore_me(true);

// в конце изменений ...
	if (onSuccess instanceof Function) onSuccess(on);
}

// переключение галки (data.SELECTED)
this.switchOnOff = function(fieldName) {
	if (!fieldName) fieldName='SELECTED';
		if (!this.selected) return;
	if (this.selected.data[fieldName]) this.selected.data[fieldName]=0;
		else this.selected.data[fieldName]=1;
	this.save_row();
}

this.editorGrid_beforeedit = function(){
	xg(conf.dbg)._editorGrid_editing=true;
}

// -------------------------------------
// деструктор (чтобы убрать свои обработчики событий)
// желательно вызывать при переинициализации класса
this.destroy = function(){
	if (
		xg(conf.dbg).xtype=='editorgrid'
	) {
		xg(conf.dbg).removeListener('beforeedit', this.editorGrid_beforeedit);
	}
	xg(conf.dbg).removeListener('click', this.click);
		xg(conf.dbg).removeListener('activate', this.restore_me);
		if (xg(conf.dbg)._rendered) xg(conf.dbg).getView().scroller.removeListener('scroll', this.restore_me);
	xg(conf.dbg).removeListener('cellclick', this.cell_click);
	xg(conf.dbg).removeListener('celldblclick', this.cell_dbl_click);
		xg(conf.dbg).removeListener('validateedit', this.validateedit);
	xg(conf.searcher).removeListener('keydown', this.searcher_keydown);
	xg(conf.searcher).removeListener('valid', this._apply_locator);
		xg(conf.searcher).removeListener('focus', _on_focus);
		xg(conf.searcher).removeListener('blur', _on_blur);
	if (conf._grid_editors) for(var i in conf._grid_editors) {
		var ed=conf._grid_editors[i];
		if (ed instanceof Function) continue;
		ed.editor.removeListener('validateedit', this.validateedit);
	}
	xg(conf.dbg).searcher=null;
}

// -------------------------------------
// конструктор
// -------------------------------------

// удалим старую версию (вызовем деструктор)
	if (!document.__sea) document.__sea={};
	if (document.__sea[conf.dbg]) {
		document.__sea[conf.dbg].destroy(); delete document.__sea[conf.dbg];
	}

// зарегистрируем сами себя
	document.__sea[conf.dbg]=this;

// инициализация обработчиков событий и пр.
	if (!conf.search_delay) conf.search_delay=150;
	xg(conf.dbg).searcher=this;
	this.conf = conf;
	if (conf.remote_search_func) this.use_remote_search=true;

// грид
	xg(conf.dbg).getStore().loadData(conf.local_data);
	this.drop_locator();

// если editor-grid - надем все доступные колонки для редактирования
	if (
		xg(conf.dbg).startEditing
	) {
		var grid_editors=[];
		for(var i=0; i<xg(conf.dbg).getColumnModel().columns.length; i++) {
			var ed=xg(conf.dbg).colModel.getCellEditor(i,0);
			if (ed) {
				grid_editors[grid_editors.length]={col:i,editor:ed};
				ed.addListener('hide',this.int_editor_hide);
			}
		}
		if (grid_editors.length>0)
			conf._grid_editors=grid_editors;
	}
	if (
		xg(conf.dbg).xtype=='editorgrid'
	) {
		xg(conf.dbg).addListener('beforeedit', this.editorGrid_beforeedit);
	}

// события
	xg(conf.dbg)._rendered=xg(conf.dbg).getView().scroller;
		xg(conf.dbg).addListener('cellclick', this.cell_click);
		xg(conf.dbg).addListener('celldblclick', this.cell_dbl_click);
		xg(conf.searcher).addListener('keydown', this.searcher_keydown);
		xg(conf.searcher).addListener('valid', this._apply_locator);
			xg(conf.searcher).addListener('focus', _on_focus);
			xg(conf.searcher).addListener('blur', _on_blur);
		xg(conf.dbg).addListener('click', this.click);
		xg(conf.dbg).addListener('activate', this.restore_me);
	if (!xg(conf.dbg)._rendered) xg(conf.dbg).addListener('afterrender', function(){
		xg(conf.dbg)._rendered=true;
		xg(conf.dbg).getView().scroller.addListener('scroll', this.restore_me);
	}); else {
		xg(conf.dbg).getView().scroller.addListener('scroll', this.restore_me);
	}
		xg(conf.dbg).addListener('validateedit',this.validateedit);

// blur по-умолчанию
	xg(conf.searcher)._init=true;
	window.setTimeout(function(){
		_on_blur();
		xg(conf.searcher)._init=false;
	},100);

}

// #17571  GridDragDropRowOrder
GridDragDropRowOrder = Ext.extend(Ext.util.Observable, {
    copy: false,
    scrollable: false,
    constructor: function(config) {
        if (config) { Ext.apply(this, config); }
        this.addEvents({
            beforerowmove: true,
            afterrowmove: true,
            beforerowcopy: true,
            afterrowcopy: true
        });
        GridDragDropRowOrder.superclass.constructor.call(this);
    },
    init: function (grid) {
        this.grid = grid;
        grid.enableDragDrop = true;
        grid.on({
            render: { fn: this.onGridRender, scope: this, single: true }
        });
    },
    onGridRender: function (grid)
    {
        var self = this;
        this.target = new Ext.dd.DropTarget(grid.getEl(), {
            ddGroup: grid.ddGroup || 'GridDD',
            grid: grid,
            gridDropTarget: this,
            notifyDrop: function(dd, e, data)
            {
                // Remove drag lines. The 'if' condition prevents null error when drop occurs without dragging out of the selection area
                if (this.currentRowEl)
                {
                    this.currentRowEl.removeClass('grid-row-insert-below');
                    this.currentRowEl.removeClass('grid-row-insert-above');
                }
                // determine the row
                var t = Ext.lib.Event.getTarget(e);
                var rindex = this.grid.getView().findRowIndex(t);
                if (rindex === false || rindex == data.rowIndex)
                {
                    return false;
                }
                // fire the before move/copy event
                if (this.gridDropTarget.fireEvent(self.copy ? 'beforerowcopy' : 'beforerowmove',
      				this.gridDropTarget, data.rowIndex, rindex, data.selections, 123) === false)
                {
                    return false;
                }
                // update the store
                var ds = this.grid.getStore();

                // Changes for multiselction by Spirit
                var selections = new Array();
                var keys = ds.data.keys;
                for (var key in keys) {
                    for (var i = 0; i < data.selections.length; i++) {
                        if (keys[key] == data.selections[i].id) {
                            // Exit to prevent drop of selected records on itself.
                            if (rindex == key) {
                                return false;
                            }
                            selections.push(data.selections[i]);
                        }
                    }
                }
                // fix rowindex based on before/after move
                if (rindex > data.rowIndex && this.rowPosition < 0) {
                    rindex--;
                }
                if (rindex < data.rowIndex && this.rowPosition > 0) {
                    rindex++;
                }
                // fix rowindex for multiselection
                if (rindex > data.rowIndex && data.selections.length > 1) {
                    rindex = rindex - (data.selections.length - 1);
                }
                // we tried to move this node before the next sibling, we stay in place
                if (rindex == data.rowIndex) {
                    return false;
                }
                // fire the before move/copy event
                /* dupe - does it belong here or above???
                if (this.gridDropTarget.fireEvent(self.copy ? 'beforerowcopy' : 'beforerowmove', this.gridDropTarget, data.rowIndex, rindex, data.selections, 123) === false)
                {
                    return false;
                }
                */
				  // tur21: <<< prevent record delete & create after each move: disable autosave and events */
				  var _as = ds.autoSave, _es1 = !ds.eventsSuspended, _es2 = !ds.data.eventsSuspended;
				  if (_as) ds.autoSave = false;
				  if (_es1) { ds.suspendEvents(false); }
				  if (_es2) { ds.data.suspendEvents(false); }
				  // tur21: >>>
				  if (!self.copy) {
				  	for (var i = 0; i < data.selections.length; i++) {
				  		ds.remove(ds.getById(data.selections[i].id));
				  	}
				  }
				  for (var i = selections.length - 1; i >= 0; i--) {
				  	var insertIndex = rindex;
				  	ds.insert(insertIndex, selections[i]);
				  }
				  // tur21: <<< restore autosave and events
				  if (_as) ds.autoSave = _as;
				  if (_es1) ds.data.resumeEvents();
				  if (_es2) ds.resumeEvents();
				  // tur21: >>>
				  // tur21: <<< save row order - http://www.sencha.com/forum/showthre...n-a-Grid/page2
				  for (var i = 0, j = 1, len = ds.data.length; i < len; i++, j++ ) {
				  	if (ds.data.items[i].get('order') != j  ) {
				  		ds.data.items[i].set('order',j);  
				  	} 
				  }
				  // tur21: >>>
                // re-select the row(s)
                var sm = this.grid.getSelectionModel();
                if (sm) {
					sm.selectRecords(data.selections);
				}
            // fire the after move/copy event
              this.gridDropTarget.fireEvent(self.copy ? 'afterrowcopy' : 'afterrowmove', this.gridDropTarget, data.rowIndex, rindex, data.selections);
            //xg('dbgGroupF').searcher.conf.local_data.data=xg('dbgGroupF').searcher.conf.local_data.data; 
              //console.log(ds);
            //console.log('save dta');
	            //console.log(xg('dbgSelF').searcher.conf.local_data);
	            var new_ds = [];
	            ds.data.items.forEach(function(value, i) {
	            	new_ds.push(value.data);
	            })
	            //console.log(new_ds);
	            xg(dd.grid.id).searcher.conf.local_data.data = new_ds;
	            //console.log(xg(dd.grid.id).searcher.conf.local_data);
							xg(dd.grid.id).getStore().loadData(xg(dd.grid.id).searcher.conf.local_data);

            // M2: fire event ...
							if (
								this.gridDropTarget.grid &&
								this.gridDropTarget.grid.initialConfig &&
								this.gridDropTarget.grid.initialConfig.listeners &&
								this.gridDropTarget.grid.initialConfig.listeners.afterrowmove instanceof Function
							) this.gridDropTarget.grid.initialConfig.listeners.afterrowmove(
								this.gridDropTarget.grid, data.selections[0].data);

              return true;
            },
            notifyOver: function(dd, e, data)
            {
                var t = Ext.lib.Event.getTarget(e);
                var rindex = this.grid.getView().findRowIndex(t);
                // Similar to the code in notifyDrop. Filters for selected rows and quits function if any one row matches the current selected row.
                var ds = this.grid.getStore();
                var keys = ds.data.keys;
                for (var key in keys) {
                    for (var i = 0; i < data.selections.length; i++) {
                        if (keys[key] == data.selections[i].id) {
                            if (rindex == key) {
                                if (this.currentRowEl) {
                                    this.currentRowEl.removeClass('grid-row-insert-below');
                                    this.currentRowEl.removeClass('grid-row-insert-above');
                                }
                                return this.dropNotAllowed;
                            }
                        }
                    }
                }
                // If on first row, remove upper line. Prevents negative index error as a result of rindex going negative.
                if (rindex < 0 || rindex === false) {
                    this.currentRowEl.removeClass('grid-row-insert-above');
                    return this.dropNotAllowed;
                }
                try {
                    var currentRow = this.grid.getView().getRow(rindex);
                    // Find position of row relative to page (adjusting for grid's scroll position)
                    var resolvedRow = new Ext.Element(currentRow).getY() - this.grid.getView().scroller.dom.scrollTop;
                    var rowHeight = currentRow.offsetHeight;
                    // Cursor relative to a row. -ve value implies cursor is above the row's middle and +ve value implues cursor is below the row's middle.
                    this.rowPosition = e.getPageY() - resolvedRow - (rowHeight/2);
                    // Clear drag line.
                    if (this.currentRowEl) {
                        this.currentRowEl.removeClass('grid-row-insert-below');
                        this.currentRowEl.removeClass('grid-row-insert-above');
                    }
                    if (this.rowPosition > 0) {
                        // If the pointer is on the bottom half of the row.
                        this.currentRowEl = new Ext.Element(currentRow);
                        this.currentRowEl.addClass('grid-row-insert-below');
                    }
                    else {
                        // If the pointer is on the top half of the row.
                        if (rindex - 1 >= 0) {
                            var previousRow = this.grid.getView().getRow(rindex - 1);
                            this.currentRowEl = new Ext.Element(previousRow);
                            this.currentRowEl.addClass('grid-row-insert-below');
                        }
                        else {
                            // If the pointer is on the top half of the first row.
                            this.currentRowEl.addClass('grid-row-insert-above');
                        }
                    }
                }
                catch (err) {
                    console.warn(err);
                    rindex = false;
                }
                return (rindex === false) ? this.dropNotAllowed : this.dropAllowed;
            },
            notifyOut: function(dd, e, data) {
                // Remove drag lines when pointer leaves the gridView.
                if (this.currentRowEl) {
                    this.currentRowEl.removeClass('grid-row-insert-above');
                    this.currentRowEl.removeClass('grid-row-insert-below');
                }
            }
        });
        if (this.targetCfg) {
            Ext.apply(this.target, this.targetCfg);
        }
        if (this.scrollable)
        {
            Ext.dd.ScrollManager.register(grid.getView().getEditorParent());
            grid.on({
                beforedestroy: this.onBeforeDestroy,
                scope: this,
                single: true
            });
        }
    },
    getTarget: function() { return this.target; },
    getGrid: function() { return this.grid; },
    getCopy: function() { return this.copy ? true : false; },
    setCopy: function(b) { this.copy = b ? true : false; },
    onBeforeDestroy : function (grid) {
        // if we previously registered with the scroll manager, unregister
        // it (if we don't it will lead to problems in IE)
        Ext.dd.ScrollManager.unregister(grid.getView().getEditorParent());
    }
});
