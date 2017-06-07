/**
 * @Author:	  Live
 * @Email:       ivill@live.com
 * @DateTime:	2016-11-03 13:59:03
 * @Description: popover 二次确认框
 * @Require: [JQuery, Bootstrap]
 */

define(function() {
	'use strict';

	var _options = {
			UID: '', // 唯一识别符，比如 ID，UserID 等，以确保重复点击显示、隐藏不会闪烁
			title: '提示', // 标题
			loadingContent: '努力加载中...', // ajax 加载中提示语
			ajax: { // ajax 配置项
				config: {
		            type: 'GET', // ajax 请求类型
		            url: '', // ajax 请求地址
		            data: {} // ajax 参数
		            // ... other
		        },
		        callback: function( res ) {} // ajax success 回调函数
			},
			$trigger: null // popover 触发者
		},
		_popoverSelector = '', // 当前弹出的 popover 的选择器
		_timestamp = (new Date()).getTime(); // 使用时间戳作为 确定、取消按钮 的 id 名称后缀
		
	var CONFIRM_TPL = '<div class="btn-group">' +
				 '<button type="button" id="' + _getIDName( 'J_Confirm' ) + '" class="btn btn-xs btn-primary"><i class="glyphicon glyphicon-ok-sign">&ensp;</i>确定</button>' +
				 '<button type="button" id="' + _getIDName( 'J_Cancel' ) + '" class="btn btn-xs btn-default"><i class="glyphicon glyphicon-remove-sign">&ensp;</i>取消</button>' +
			  '</div>';


	/**
     * 切换按钮的禁用属性
     */
    function _toggleBtnDisableAttr( $btn ) {
		$btn.prop('disabled', function (_, val) { return ! val; });
    }

    /**
     * 生成页面唯一的 id
     * @param  {String} idName
     * @return {String}        idName + postfix
     */
	function _getIDName( idName ) {
		return idName + _timestamp;
	}

	// 需要在模块引用的时候会自动执行（保证执行一次）
	function _bind() {
		// 点击 popover 以外的区域，隐藏 popover
		$( document ).on('click', function() {
			destroy();
		});

		// 启用、禁用 Popover 取消、确定点击绑定
		$( document ).on('click', '#' + _getIDName( 'J_Confirm' ), function() {
			_confirm( $(this) );
		});
		$( document ).on('click', '#' + _getIDName( 'J_Cancel' ), function() {
			destroy();
		});
	}
	
	/**
	 * 确认操作
	 */
	function _confirm() {
		var ajaxConfig = { // ajax 配置项
				type: _options.ajax.type,
				url: _options.ajax.url,
				data: _options.ajax.data,
				cache: false,
				complete: function() {
					_toggleBtnDisableAttr( _options.$trigger );
				},
				success: function( res ) {
					_options.ajax.callback( res );
				},
				error: function( error ) {
					setContent({
						title: '<span class="text-danger">操作失败</span>',
						content: '<span class="text-danger">网络错误，请刷新后重试！</span>'
					});
				}
			};

		$.extend( ajaxConfig, _options.ajax.config );

		_toggleBtnDisableAttr( _options.$trigger );

		setContent({
			content: _options.loadingContent
		});

		$.ajax( ajaxConfig );
	}

	/**
	 * 获取 popover 的 selector
	 * @return { Selector }
	 */
	function _getSelector() {
		return '#' + _options.$trigger.attr( 'aria-describedby' );
	}


	/**
	 * 阻止点击 popover 冒泡事件
	 */
	function _stopPropagation( selector ) {
		$( document ).on('click', selector, function( e ) {
			e.stopPropagation();
		});
	}

	/**
	 * 初始化
	 * @param  {Object} options 配置项，详见开头 _options 的说明
	 */
	function init( options ) {
		var isNewUID = (_options.UID !== options.UID);

		destroy();

		if ( isNewUID ) { // 点击的如果不是同一个按钮，则切换显示、隐藏
			$.extend( _options, options );

			_options.$trigger.popover({
				html: true,
				placement: 'left',
				trigger: 'manual',
				title: _options.title,
				content: CONFIRM_TPL
			});

			show();
			_popoverSelector = _getSelector();
			_stopPropagation( _popoverSelector ); // 必须先 show popover 才能获取到 selector
		}
	}

	/**
	 * 显示
	 */
	function show() {
		if ( _options.$trigger !== null ) {
			_options.$trigger.popover( 'show' );
		}
	}

	/**
	 * 隐藏
	 */
	function hide() {
		if ( _options.$trigger !== null ) {
			_options.$trigger.popover( 'hide' );
		}
	}

	/**
	 * 销毁
	 */
	function destroy() {
		if ( _options.$trigger !== null ) {
			_options.UID = ''; // 清空 uid
			_options.$trigger.popover( 'destroy' ); // 销毁 popover
			_options.$trigger.attr( "data-content", '' ); // 清空 content，防止影响后面配置 content
			_options.$trigger.attr( "data-original-title", '' ); // 清空 title，防止影响后面配置 title
		}
	}

	/**
	 * 设置 popover 的内容
	 * @param {Object} options 设置的内容对象
	 * {
	 *     title: '这是标题',
	 *     content: '这是内容'
	 * }
	 */
	function setContent( options ) {
		var title = options.title,
			content = options.content;

		if ( typeof title !== 'undefined' ) {
			_options.$trigger.attr( "data-original-title", title );
		}

		if ( typeof content !== 'undefined' ) {
			_options.$trigger.attr( "data-content", content );
		}

		_options.$trigger.popover( 'show' );
	}

	_bind();
	return {
		init: init,
		show: show,
		hide: hide,
		destroy: destroy,
		setContent: setContent
	};
});