/**
 * Created by rubyisapm on 16/10/13.
 */
!function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.popoverConfirm = factory();
  }
}(this, function () {
  var Popover = null,
    idPostfix = (new Date()).getTime(), // 确定、取消按钮 id 后缀
    TPL = '<div class="btn-group">' +
      '<button type="button" id="' + getIDName( 'J_Confirm' ) + '" class="btn btn-xs btn-primary"><i class="glyphicon glyphicon-ok-sign">&ensp;</i>确定</button>' +
      '<button type="button" id="' + getIDName( 'J_Cancel' ) + '" class="btn btn-xs btn-default"><i class="glyphicon glyphicon-remove-sign">&ensp;</i>取消</button>' +
      '</div>';

  /**
   * 切换按钮的禁用属性
   */
  function toggleBtnDisableAttr( $btn ) {
    $btn.prop('disabled', function (_, val) { return ! val; });
  }

  /**
   * 生成页面唯一的 id
   * @param  {String} idName
   * @return {String}        idName + postfix
   */
  function getIDName( idName ) {
    return idName + idPostfix;
  }

  function bindBase() {
    // 点击 popover 以外的区域，隐藏 popover
    $( document ).on('click', function() {
      Popover.destroy();
    });

    // 启用、禁用 Popover 取消、确定点击绑定
    $( document ).on('click', '#' + getIDName( 'J_Confirm' ), function() {
      Popover._confirm( $(this) );
    });
    $( document ).on('click', '#' + getIDName( 'J_Cancel' ), function() {
      Popover.hide();
    });

  }
  // 需要在模块引用的时候会自动执行（保证执行一次）
  bindBase();

  Popover = {
    conf: {
      UID: '', // 唯一识别码
      title: '确定？',
      loadingContent: '请求中......',
      ajax: null,
      $trigger: null
    },
    selector: '', // 当前弹出的 popover 的选择器
    init: function(conf ) {
      var _this = this;

      if (_this.conf.UID === conf.UID) { // 点击的是同一个按钮，则切换显示、隐藏
        _this.toggle();

      } else {
        _this.destroy();

        $.extend( _this.conf, conf );

        _this.conf.$trigger.popover({
          html: true,
          placement: 'left',
          trigger: 'manual',
          title: _this.conf.title,
          content: TPL
        });
        _this.show();
      }

      _this._setSelector( _this._getSelector() );
      _this._bind();
    },
    _confirm: function() { // 确认操作
      var _this = this,
        ajaxConfig = {
          type: _this.conf.ajax.type,
          url: _this.conf.ajax.url,
          data: _this.conf.ajax.data,
          cache: false,
          complete: function() {
            toggleBtnDisableAttr( _this.conf.$trigger );
          },
          success: function( res ) {
            _this.conf.ajax.callback( res );
          },
          error: function(error) {
            _this.destroy();
            alert( '网络错误或登录失效，请刷新重试或重新登录！' );
          }
        };

      $.extend( ajaxConfig, _this.conf.ajax.config );

      toggleBtnDisableAttr( _this.conf.$trigger );
      _this._setSubmitStatus( 'loading');

      $.ajax( ajaxConfig );
    },
    _bind: function() { // 点击 popoover 本身阻止冒泡，这样不会传递到 document 上而关闭 popover（见方法 bindBase）
      var _this = this;

      $( document ).on('click', _this.selector, function(e) {
        e.stopPropagation();
      });
    },
    toggle: function() { // 切换显示、隐藏
      var _this = this;

      if (_this.conf.$trigger !== null ) {
        _this.conf.$trigger.popover( 'toggle' );
      }
    },
    show: function() {
      var _this = this;

      if (_this.conf.$trigger !== null ) {
        _this.conf.$trigger.popover( 'show' );
      }
    },
    hide: function() {
      var _this = this;

      if (_this.conf.$trigger !== null ) {
        _this.conf.$trigger.popover( 'hide' );
      }
    },
    destroy: function() {
      var _this = this;

      if (_this.conf.$trigger !== null) {
        _this.conf.UID = '';
        _this.conf.$trigger.popover( 'destroy' );
      }
    },
    /**
     * 获取 popover 的 selector
     * @return { Selector }
     */
    _getSelector: function() {
      return '#' + this.conf.$trigger.attr( 'aria-describedby' );
    },
    /**
     * 设置 popover 的选择器
     * @param {Selector} selector
     */
    _setSelector: function( selector ) {
      this.selector = selector;
    },
    /**
     * 设置启用、禁用操作提交Ajax的状态提示
     * @param {String} status 加载描述
     */
    _setSubmitStatus: function( status ) {
      var _this = this,
        message = '';

      if (status == 'loading') {
        message = _this.conf.loadingContent;
      } else {
        message = message + '失败了！';
      }

      $( _this.selector ).find('.popover-content').html( message );
    }
  };

  return {
    init: function( conf ) {
      Popover.init( conf );
    },
    toggle: function() {
      Popover.toggle();
    },
    show: function() {
      Popover.show();
    },
    hide: function() {
      Popover.hide();
    },
    destroy: function() {
      Popover.destroy();
    }
  };
})