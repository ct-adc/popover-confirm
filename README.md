# popover-confirm
基于 Bootstrap，依赖 jQuery 的二次确认弱弹框

# Demo

使用 Node 开启本地模拟 server
```
node server e
```

打开浏览器，输入 demo 演示地址：

```
http://localhost:8000/demo/index.html
```

# Usage

```javascript
// ...

// 这个方法不写也行，可以在 show 方法里面合并
function showUpdateStatusConfirm( e, index, data ) {
    e.stopPropagation(); // 终止事件在传播过程的捕获、目标处理或起泡阶段进一步传播
    show( $(this), index, data);
}

// ...

function show( $trigger, index, data ) {
    var _this = this;
    var handleName = data.status === 1 ? '启用' : '禁用';
    
    PopoverConfirm.init({
        UID: data.id, // 数据中唯一标识符，比如 ID，UserID 等，以确保重复点击显示、隐藏不会闪烁
        title: '确定'+ handleName +'？',
        loadingContent: handleName + '生效中.........', // Popover 加载中提示文字
        $trigger: $trigger, // 触发者
        ajax: {
            config: { // ajax 配置
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                url: URL.changeStatus,
                data: data,
            }, // success 回调函数
            callback: function( res ) {
                if ( res.Status ) {
                    const miniMsg = new MiniMsg({
                        content: handleName + '成功',
                        duration: 2,
                        container: $('body'),
                        type: 'success'
                    });

                    PopoverConfirm.destroy(); // 销毁
                    miniMsg.animation(() => {
                        avalon.vmodels.main.data[ index ].Status = data.status; // 更改数据状态
                    });
                } else {
                    const miniMsg = new MiniMsg({
                        content: res.Message,
                        duration: 3,
                        container: $('body'),
                        type: 'error'
                    });

                    PopoverConfirm.hide();
                    miniMsg.animation();
                }
            }
        }
    });
}

// ...
```