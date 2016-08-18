/**
 * Created by jason.hei on 2016/7/24.
 */
$(function(){
    $("#btnSubmit").click(function(){
        var wsdlUrl = $("#wsdlOption").val(),
            soapData = $("#soapData").val();
        $.post("/tools/requestPost",{"wsdlUrl":wsdlUrl,"soapData":soapData },function(data){
            $("#soapResp").text($.format(data)).removeClass('prettyprinted');
            prettyPrint();
        });
    });

    $("#btnReset").click(function(){
        $("#wsdlOption option:eq(0)").prop("selected",true);
        $("#soapData").val('');
        $("#soapResp").text('').removeClass('prettyprinted');
    });

})