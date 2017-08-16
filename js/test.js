/**
 * Created by jo.chan on 2017/8/8.
 */


var defer=$.Deferred();
defer.resolve(1);

//deferred对象已经resolve了
defer.done(function(v){
    alert(v);    //不会执行
});
alert(2);
