/**
 * Created by jason.hei on 2016/7/25.
 */
$(function(){

    $("#btnSubmit").click(function(){
        var checkUrl = $("#localOption").val();
        $.post("/tools/localProxyCheckResult",{"checkUrl":checkUrl },function(data){
            $("#checkResult").html(data.result).removeClass('prettyprinted');
            $("#ResponseCode").html(data.code);
            prettyPrint();
        },'json');
    });

})