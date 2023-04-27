// --------------------------------------
function init_main_view()
{
// кнопки
	new Ext.KeyMap( document, [{
		key: Ext.EventObject.F1,
			ctrl: false, alt:false, shift:false,
		fn: function(el,e){
			e.stopEvent(); docInfo(); }
	}, {
		key: Ext.EventObject.F2,
			ctrl: false, alt:false, shift:false,
		fn: function(el,e){
			e.stopEvent(); save(); }
	}, /*{
		key: Ext.EventObject.F5,
			ctrl: false, alt:false, shift:false,
		fn: function(el,e){
			e.stopEvent(); print(); }
	},*/ {
		key: Ext.EventObject.F9,
			ctrl: false, alt:false, shift:false,
		fn: function(el,e){
			e.stopEvent(); post(); }
	}]);
	
// главная форма
	document.pHdHeight=60;
	document.view = new Ext.Viewport({
		layout:'border', border:false,
			defaults:{border:false, },
		items:[{
			// ---- шапка ----
			xtype:'panel', id:'pHd',
				region:'north', heigth:document.pHdHeight,
				bodyStyle:'background-color:transparent;',
			listeners:{afterrender:function(){window.setTimeout(function(){
				xg('pHd').setHeight(document.pHdHeight);
				document.view.doLayout(); },50); }},
			tbar:{height:27, items:[{
				xtype:'button', icon: PICONS.help,
					tooltip:{title:'Информация',text:'о документе',},
				handler:docInfo,
				}, {
				xtype:'button', id:'bShowHeader',
					icon: PICONS.play_forward,
					enableToggle:true, allowDepress:true, pressed:true,
				tooltip:{title:'Показать',text:'Дополнительные поля документа',},
				handler:function(){
					xg('pHd').setHeight(
						xg('bShowHeader').pressed ?document.pHdHeight :27);
					document.view.doLayout();
				},
				}, {
					xtype:'label', text:'Корректировка серии №', id:'ldTitle',
						style: { fontWeight:'bold', marginLeft:3, marginRight:3, color:'maroon',},
				}, {
					xtype:'textfield', id:'edd_DocNo',
						width:50, readOnly:true,
				}, {
				xtype:'label', text:'от',
					style: { fontWeight:'bold', marginLeft:5, marginRight:5, color:'maroon',},
				}, {
					xtype:'datefield', id:'edd_DateOf',
						width:85, allowBlank:false,
					listeners:{select:function(){
						document.modifyed++; showBtns(); }},
				}, {
					xtype:'tbfill'
				}, {
					xtype:'tbspacer', width:15,
				}, /*{
					xtype:'button',	id:'bPrint', hidden:true,
						icon:PICONS.print,
					tooltip:{title:'F5',text:'Печать документа',},
						text:'Печать',
					handler:print,
				},*/ {
					xtype:'button',	id:'bSave', hidden:false,
						icon:PICONS.save,
					tooltip:{title:'F2',text:'Сохранить',},
						text:'<b>Сохранить</b>',
					handler:save,
				}, {
					xtype:'button',	id:'bPost', hidden:true,
						icon:PICONS.play,
					tooltip:{title:'F9',text:'Провести',},
						text:'<b>Провести</b>',
					handler:post,
				}, {
					xtype:'button',	id:'bUnPost', hidden:true,
						icon:PICONS.play_pause,
					tooltip:{title:'F9',text:'Распровести',},
						text:'<b>Распровести</b>',
					handler:post,
				}
			],},
			layout:'border', defaults:{ border:false, },
			items:[{
				xtype:'panel',
					region:'center', height:27, //north
					layout:'border', defaults:{ border:false, },
				items:[{
					xtype:'panel',
						region:'west', width:300,
					bodyStyle:'background-color:transparent; padding:5px;',
						layout:'form', labelAlign:'right', labelWidth:30,
					items:[{
						xtype:'combo', id:'edd_Dep',
							fieldLabel:'Где', anchor:'100%', listWidth:350,
							emptyText:'введен документ',
						mode: 'local',
							allowBlank:false, forceSelection:true, editable:false,
							selectOnFocus:true, autoSelect:false, triggerAction: 'all',
						store: new Ext.data.JsonStore({}),
							valueField: 'ID',	displayField: 'NAME',
						listeners:{select:function(){
							document._dep_id=xg('edd_Dep').getValue();
							document.tb.hd.DEP_ID=xg('edd_Dep').getValue();
							document.modifyed++; showBtns();
						}},
					}]
				}, {
					xtype:'panel',
						region:'center', 
					bodyStyle:'background-color:transparent; padding:5px;',
						layout:'form', labelAlign:'right', labelWidth:70,
					items:[{
						xtype:'textfield', id:'edd_Comment',
							fieldLabel:'Основание', //anchor:'100%',
							width:500,
						listeners:{change:function(){
							document.modifyed++; showBtns(); }},
					},]
				},]
			},]
		}, {
// -----
			xtype:'editorgrid', id:'dbg',
				region:'center',
			tbar:{height:27, items:[{
				xtype:'button', icon: PICONS.refresh,
				handler:load,
				}, {
					xtype:'label', text:'Состав',
						style: { fontWeight:'bold', marginRight:3, color:'navy',},
				}, {
					xtype:'textfield', id:'eSea',
						enableKeyEvents:true, emptyText:'поиск',
						minLength: 3, width: 150,
				}, {
					xtype:'label',text:'Подразделение',
						style: { fontweight:'bold', marginRight:3, marginLeft:5, color:'red',},
				}, {
					xtype:'textfield', id:'depNameSea',
						enableKeyEvents: true, emptyText:'подразделение',
						minLength: 3, width: 150,
				}, {
					xtype:'label', id:'ldRc',
						style: { fontWeight:'bold', marginLeft:10, color:'navy',},
				}, {
					xtype:'tbfill'
				}, {
					xtype:'label', id:'ldTotals',
					style: { marginRight:5, }, //paddingTop:3, fontWeight:'bold', color:'maroon', }
				}, {
					xtype:'button',
						text:'Еще',
					menu:[{
						text:'Восстановить колонки по-умолчанию',
						handler:function(){
							var lk=localStorageKey();
								localStorage.removeItem(lk+'-setseries.cols');
							window.location.reload();
						}
					}]
				}
			]},
			store: new Ext.data.JsonStore({}),
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					sortable: true, menuDisabled: true, },
				columns: [{
					header:'Цена', width:50,
						dataIndex: 'PRICE', renderer:rndPrice,
				}, {
					header:'Сумма', width:60,
						dataIndex: 'SUMMA', renderer:rndSummaT,
				}, {
					header:'Остаток', width:60,
						//tooltip:'текущий остаток минус резервы текущего дня',
						dataIndex: 'QUA', //renderer:rndStQua,
				}, {
					header:'Наименование', width:250,
						dataIndex: 'PNAME', renderer:rndPname,
				}, {
					header:'Производитель', width:150,
						dataIndex: 'VNAME', renderer:rndSwap,
				}, {
					header:'Подразделение', width:150,
						dataIndex: 'DEP_NAME', 
				}, {
					header:'#item', width:100,
						dataIndex: 'ITEM_ID', 
				}, {
					header:'#supno', width:100,
						dataIndex: 'SUPNO', 
				}]
			}),
			selModel:new Ext.grid.CellSelectionModel(),
			view:new Ext.ux.grid.BufferView({rowHeight: 34,}),
		}, {
// -----
			xtype:'editorgrid', id:'dbgProp',
				title:'Свойства партии', collapsible:false,
			region:'west', width:310, split:true,

			//поиск в параметрах
			tbar:{height:27, items:[{
				xtype:'textfield', id:'eSeaProp',
					enableKeyEvents:true, emptyText:'поиск',
					minLength: 3, width: 100,
			}, {
				xtype:'tbfill'
			}, {
				xtype:'button',	id:'bShowAllE', hidden:true,
					icon:PICONS.find,
				enableToggle:true, allowDepress:true,
					tooltip:{title:'Показать',text:'скрытые реквизиты',},
			}],hidden:true,},
			hideHeaders:false,
			store: new Ext.data.JsonStore({}),
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					sortable: true, menuDisabled: true, },
				columns: [{
						header:'Параметр', width:150, grid:'dbgProp', hidden:false,
							dataIndex: 'NAME', 
					}, {
						header:'Текущее', width:80,
							dataIndex: 'OLD', renderer:rndProp,
						listeners:{
							click:function(){//#25780
								document.se.PROP.selected.data.NEW=document.se.PROP.selected.data.OLD
								document.se.PROP.save_row();
							}
						},
					}, {
						header:'Новое', width:80, id:'cbEdProp',
							dataIndex: 'NEW', renderer:rndProp,
						editor: new Ext.form.TextField({
							id:'edProp', selectOnFocus:true,
								enableKeyEvents:true,	
							listeners:{
								keydown:function(th,e){
									if (e.getKey()==13)
										document.se.PROP.focus_cell('+1',0);
								}
							},
						},),						
					}]
			}), selModel:new Ext.grid.CellSelectionModel(),
	},],},);
}

function rndProp(value, metadata, record, rowIndex, colIndex, store)
{
	if (record.data.TYPE=='d') {
		if (value.indexOf('-')<1) return value;
		value=rndDate4(value, metadata, record, rowIndex, colIndex, store);
	} else
		if (record.data.TYPE=='m') {
			//value=rndChckSelect(value, metadata, record, rowIndex, colIndex, store, this.scope); 
			//value=value == "1" ? "1" : "0";
		} else
	if (!value) value='&nbsp;';

	return value;
}

// --------------------------------------
function rndPrice(value, metadata, record, rowIndex, colIndex, store)
{
	value
		=rndSummaT(value, metadata, record, rowIndex, colIndex, store);
	if (Math.abs(record.data.PRICE - record.data.SPRICE)>0.009)
		metadata.style=metadata.style+'color:red;';
	return value;
}


function rndStQua(value, metadata, record, rowIndex, colIndex, store)
{
	value=rndQua(
		record.data.QUA-record.data.QUA_R,
		metadata, record, rowIndex, colIndex, store);
	if (
		!document.readOnly && record.data.QUA>record.data.QUA-record.data.QUA_R
	) metadata.style=metadata.style
		+'color:red;font-weight:bold;background-color:yellow;';
		else metadata.style=metadata.style+'background-color:aqua;';
		value=rndDvQua(record.data.QUA-record.data.QUA_R, metadata, record, rowIndex, colIndex, store);//#23403
	if (record.data.QUA_R) {
		if (!value) value='0'
	value=value+sprintf(
		'<div style="color:blue;" title="резервы тек.дня">+%s</div>',
		rndDvQua(record.data.QUA_R, metadata, record, rowIndex, colIndex, store)
	); }
	return value;
}

function rndPname(value, metadata, record, rowIndex, colIndex, store)
{
	value=sprintf(
		'<div>%s</div><div style="padding-left:10px;color:gray;">%s - %s</div>',
		record.data.PNAME, record.data.VNAME, record.data.NNAME);
	return value;
}

function rndSwap(value, metadata, record, rowIndex, colIndex, store)
{
	value=sprintf('<div style="height:27px; white-space:normal;">%s</div>', value);
	return value;
}

// --------------------------------------
function loadDocData(resp)
{
	//console.log(resp);
	document.tb=resp;
	
		if (resp.err) alert2(resp.err); // сообщить предупреждение от backend
	if (resp.title) {
		if (resp.hd.TYPE_NAME) {
			document.title=resp.hd.TYPE_NAME+' '+resp.title;
			xg('ldTitle').setText(resp.hd.TYPE_NAME+' №');
		} else {
			document.title='Коррект.'+resp.title;
			xg('ldTitle').setText('Корректировка №');
		}
	}	document.modifyed=resp.hd.ID?0:1;
		document.readOnly=resp.hd.STATUS%10>0;

	// шапка
	xg('edd_DocNo').setValue(resp.hd.DOCNO);
	xg('edd_DateOf').setValue(mkDateYYYYMMDD(resp.hd.DATEOF));
	xg('edd_Dep').setValue(resp.hd.DEP_ID);
	xg('edd_Dep').setRawValue(resp.hd.DEP_NAME);
	xg('edd_Dep').getStore().loadData(document._init_data.depaw);
	xg('edd_Comment').setValue(resp.hd.COMMENT);

	// строки
	var se_conf = {
		searcher:'eSea',
			dbg:'dbg', tab_focus:'eSeaProp',
		local_data:document.tb.rows,
			search_fields:'PNAME,VNAME',
			key_fields:'ITEM_ID,SUPNO',
			data_fields:'SUPNO,QUA,PRICE,SUMMA',
		data_change:function(data){
			xg('ldRc').setText(xg('dbg').getStore().getCount());
			loadProp(data); },
		after_drop_locator:function(){
			/*if (xg('cbSeaFill').getValue()!=0) {
				xg('cbSeaFill').setValue(0);
				document.se.N.drop_locator(true); }*/
			//if (!document.modifyed)
			console.log('window.close()'); },
		editor_del:function(se,fn){
			if (document.readOnly || !document.tb.hd.isLocalDoc) return;
				se.remove_row();
			document.modifyed++; showBtns();
		},
	};
	if (!document.readOnly) {
		se_conf.on_get_remote_ext_params=function(){ return {
			dep_id: document._dep_id, id: document._id };}
		se_conf.remote_search_func='item_sea'; }
	document.se.N = new M2_EXT_SEARCHER_GRID(se_conf);
	document.se.N.restore_me(true);
	//поиск по подразделению
	let inputDepName = document.querySelector('#depNameSea');
	inputDepName.addEventListener('input', function(event) {
		// Получаем значение, введенное пользователем в поле
		let inputDepNameValue = '';
		inputDepNameValue = event.target.value;
		// Выводим значение в консоль
		console.log(inputDepNameValue);
	});
	// параметры
	document.tb.PROP={metaData:{fields:[
		'CODE','NAME','NEW','OLD','TYPE'], root:'data'},data:[]};
	var se_conf_p = {
		searcher:'eSeaProp',
			dbg:'dbgProp', 
			tab_focus:'eSea', no_focus:true,
		local_data:document.tb.PROP,
			key_fields:'CODE',
			search_fields:'NAME,CODE,OLD,NEW',
		editor_can:function(se,fn){
			if (se.selected.data.RMLY) return false;
			if (
				se.selected.data.TYPE=='d' &&
				se.selected.data.NEW.split instanceof Function &&
				se.selected.data.NEW.split('-').length==3
			) window.setTimeout(function(){
				var dt=mkDateYYYYMMDD(se.selected.data.NEW);
				xg('edProp').setValue(dt.asDateString());
			},75);
			if (document.readOnly ||
				!document.tb.hd.isLocalDoc) return false;
			return true;
		},
		editor:function(se,fn,auto,val){
			var v2=val;
			if (se.selected.data.TYPE=='d') {
				var dt=new Date();
					val=str_replace('/','.',val);
					val=str_replace(',','.',val);
					val=str_replace('-','.',val);
				if (val.indexOf('.')>0) {}
				else if (val.length==6) val=sprintf('%s.%s.20%s',
					val.substr(0,2), val.substr(2,2), val.substr(4,2));
				else if (val.length==8) val=sprintf('%s.%s.%s',
					val.substr(0,2), val.substr(2,2), val.substr(4,4));
				dt.fromDateString(val);
				v2=dt.asDateTimeStringYYMMDD();
				val=dt.asDateString(); 
				if (val.includes('aN')>0) {
					alert2('Введите корректную дату!'); return;}
			} else
			if (se.selected.data.TYPE=='i') {
				val=parseInt(val); v2=val; }
			if (se.selected.data.TYPE=='m'){
				if ((val=='0')){
					val="0"; v2="0";}
				else if (val!='1' && (val.length>0)) {
					val="1"; v2="1";}
			}
			se.selected.data["NEW_"+se.selected.data.CODE]=val; //NEW
			se.save_row();
				document.modifyed++; showBtns();
			document.se.N.selected
				.data["NEW_"+se.selected.data.CODE]=v2;
			document.se.N.save_row();
			window.setTimeout(function(){ se.restore_me(true); },250);
		}
	}; document.se.PROP = new M2_EXT_SEARCHER_GRID(se_conf_p);

// сохранить/восстановить размеры и порядок колонок
	window.setTimeout(function(){
		var lk=localStorageKey(), cc;
			cc=localStorage.getItem(lk+'-setseries.cols');
		if (cc) {
			cc=JSON.parse(cc);
			document.se.N.colsRestore(cc); }
	},250);

	if (!document._tmCols)
		document._tmCols=window.setTimeout(saveCols,500);

	showBtns();
}

function load(ask)
{
	if (ask && document.modifyed) {
		Ext.MessageBox.confirm(
			'Предупреждение',
			'Документ не сохранен!<br>Изменения будут потеряны!',
		function(btn){
			if (btn=='yes') load(false);
		} ); return; }
	m2_show_status_win('Загрузка','blue');
	m2_Ext_Ajax(
	'load', {
		dep_id: document._dep_id,
		id: document._id,
		type_id: document._type_id,
	}, function(resp) {
		loadDocData(resp);
		m2_hide_status_win();
	});
}

function saveCols()
{
	if (!document.se.N
		|| !document.se.N.colsSave) return;
	var lk=localStorageKey(),
		cs=localStorage.getItem(lk+'-series.cols'),
		cn=document.se.N.colsSave(); cn=JSON.stringify(cn);
	if (!cs || cs!=cn) {
		//console.log('fm.RCALC.saveCols()'); //: '+cn);
		localStorage.setItem(lk+'-series.cols',cn); }
	document._tmCols=window.setTimeout(saveCols,500);
}

function loadProp(row)
{
	if (!row) return;
	var ndata=[];
	//console.log(row);

	ndata.push({
		CODE:'EXPDATE', NAME:'Срок годности',
		OLD:row.OLD_EXPDATE, NEW:row.NEW_EXPDATE, TYPE:'d', });
		
	ndata.push({
		CODE:'SERIES', NAME:'Серия',
		OLD:row.OLD_SERIES, NEW:row.NEW_SERIES, TYPE:'s', });
		
	ndata.push({
		CODE:'SGTIN_MARK', NAME:'Признак маркировки',
		OLD:row.OLD_SGTIN_MARK, NEW:row.NEW_SGTIN_MARK, TYPE:'m', });
		
	document.tb.PROP.data=ndata;
	document.se.PROP.drop_locator(true);
}

function showBtns()
{
	var resp=document.tb, color='black';
		//console.log('isLocalDoc='+resp.hd.isLocalDoc+'; modifyed='+document.modifyed);
	// кнопки
	xg('bSave').setVisible(
		resp.hd.isLocalDoc &&
		resp.hd.STATUS%10<1 &&
		document.modifyed);
	xg('bPost').setVisible(
		resp.hd.ID &&
		resp.hd.isLocalDoc &&
		resp.hd.STATUS%10<1 &&
		!document.modifyed);
	xg('bUnPost').setVisible(
		resp.hd.ID &&
		resp.hd.isLocalDoc &&
		resp.hd.STATUS%10>0 &&
		!document.modifyed &&
		!haveSgtinMark());
	/*xg('bPrint').setVisible(
		resp.hd.ID &&
		resp.hd.STATUS%10>0 &&
		!document.modifyed);*/
	
	// столбцы параметров
	if(resp.hd.STATUS%10<1){
		xg('dbgProp').getColumnModel().columns[1].header='Текущее';
		xg('dbgProp').getColumnModel().columns[2].header='Новое';
	} else {
		xg('dbgProp').getColumnModel().columns[1].header='Старое';
		xg('dbgProp').getColumnModel().columns[2].header='Текущее';
	}

	// итоговые суммы
	if (document.tb.hd &&  // проведен
		document.tb.hd.STATUS%10) color='green'; else
	if (document.tb.hd && // распроведен
		document.tb.hd.STATUS) color='red';
	if (!document.tb.rows || document.tb.rows.data.length<1)
		xg('ldTotals').setText('');
	else {
		var s='';
	}

	// элементы редактора
	Ext.ComponentMgr.all.items.forEach(function(el){
		if (el.id.indexOf('edd_')!=0) return;
		if (el.id=='edd_DocNo') return; // всегда disabled!
		el.setReadOnly(document.readOnly); });

	// колонки грида
	/*window.setTimeout(function(){
		m2_Ext_dbg_set_col_visible('dbg','QUA',!document.readOnly);
	},500);*/
}

// --------------------------------------
function setDocChanged(dep_id,id)
{
	var
		lk=localStorageKey();
	localStorage.setItem(lk+'-docs_changed',
		sprintf( '%s:%d/%d:%d',
			'setseries', dep_id, id, (new Date()).getTime()
		));
}

function save()
{
	var q={
		dep_id: document._dep_id, id: document._id,
		type_id: document._type_id ? document._type_id : document.tb.hd.TYPE_ID,
		docno: xg('edd_DocNo').getValue(),
		dateof: xg('edd_DateOf').getValue(),
		comment: xg('edd_Comment').getValue(),
		rows:[]};
	 if (xg('edd_Dep').getValue()!=document._dep_id) {
	 	if (document._id) {
	 		alert2('Перенос документа в другое подразделение не реализован!'); return; } // #23315 fm_doc_header.moveDep()
	 	document._dep_id=xg('edd_Dep').getValue(); }
	if (!q.dateof) {
		alert2('Не указана дата документа!'); return; }

	if (!q.comment) {
		alert2('Не указано основание документа!'); return; }

		q.dateof=q.dateof.asDateTimeStringYYMMDD();
		if (q.sdateof) q.sdateof=q.sdateof.asDateTimeStringYYMMDD();
	document.tb.rows.data.forEach(function(rec){
		var nrec={
			item_id: rec.ITEM_ID, supno: rec.SUPNO,
			dep_id: rec.DEP_ID, //
		//	qua: rec.QUA, price: rec.PRICE, summa: rec.SUMMA,
			old_series: rec.OLD_SERIES, new_series: rec.NEW_SERIES,
			old_expdate: rec.OLD_EXPDATE, new_expdate: rec.NEW_EXPDATE,
			old_sgtin_mark: rec.OLD_SGTIN_MARK, new_sgtin_mark: rec.NEW_SGTIN_MARK};
		q.rows.push(nrec); });

	if (q.rows.length<1) {
		alert2('Документ пуст?'); return; }
	m2_show_status_win('Сохраняю документ','green');
	m2_Ext_Ajax(
		'save', q,
	function(resp){
		document.modifyed=0; if (!document.parsed_url.id) {
			setDocChanged(resp.hd.DEP_ID, resp.hd.ID);
			window.location=sprintf('%s&dep_id=%d&id=%d',
				document.self, resp.hd.DEP_ID, resp.hd.ID);
			return; }
		document._dep_id=resp.hd.DEP_ID; document._id=resp.hd.ID;
			setDocChanged(resp.hd.DEP_ID, resp.hd.ID);
		loadDocData(resp); m2_hide_status_win();
	});
}

function post()
{
	var fn='', t='';
		if (!document._id) return;
		if (document.modifyed) return;
	if (document.tb.hd.STATUS%10>0) {
		fn='unpost'; t='Распроведение';
	} else {
		fn='post'; t='Проведение'; 
	}
	
	var q ={
		dep_id: document._dep_id,
		id: document._id,
		rows:[], };
	document.tb.rows.data.forEach(function(rec){
		var nrec={
			supno: rec.SUPNO,
			dep_id: rec.DEP_ID, //
			old_series: rec.OLD_SERIES, new_series: rec.NEW_SERIES,
			old_expdate: rec.OLD_EXPDATE, new_expdate: rec.NEW_EXPDATE,
			old_sgtin_mark: rec.OLD_SGTIN_MARK, new_sgtin_mark: rec.NEW_SGTIN_MARK};
		q.rows.push(nrec); });

	m2_show_status_win(t,'red');
	m2_Ext_Ajax(fn, q, 
		function(resp) {
		setDocChanged(resp.hd.DEP_ID, resp.hd.ID);
		loadDocData(resp);
		m2_hide_status_win();
	});
}

// --------------------------------------

function haveSgtinMark()
{
	rez=false;
	document.tb.rows.data.forEach(function(rec){
		if (parseInt(rec.NEW_SGTIN_MARK)
				&& !isNaN(parseInt(rec.NEW_SGTIN_MARK)))
		{ rez=true; return; }
	});
	return rez;
}

// --------------------------------------
function docInfo()
{
	if (!document._id) return;
	fm.DV_ST.showInWindow(document._dep_id,document._id);
}

// --------------------------------------
function init()
{
	Ext.QuickTips.init();
		document.tb={}; document.se={};
	init_main_view();
		document.title='Корректировка (новый)';

	// существующий документ
	if (document.parsed_url.id) {
		document._dep_id=parseInt(document.parsed_url.dep_id);
		document._id=parseInt(document.parsed_url.id); load();
	} else
	// новый документ
	if (document.parsed_url.type_id && document.parsed_url.dep_id) {
		document._type_id=parseInt(document.parsed_url.type_id);
		document._dep_id=parseInt(document.parsed_url.dep_id);
		document._id=0; load();
	} else alert2('Неверный URL!',
		null,null,function(){ window.close(); });
} Ext.onReady(function() {init();});
