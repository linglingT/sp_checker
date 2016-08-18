/**
 * Created by jason.hei on 2016/7/25.
 */
$(function(){

    $("#btnSubmit").click(function(){
        var wsdlUrl = $("#wsdlOption").val(),
            soapData = $("#soapData").val();
        $.post("/tools/missingCheck",{"wsdlUrl":wsdlUrl,"soapData":soapData },function(data){
            var resultStr = "";
            $.each(data, function(index,element){
                resultStr += element + "<br>";
            });
            $("#soapResp").html(resultStr).removeClass('prettyprinted');
            prettyPrint();
        },'json');
    });

    $("#btnReset").click(function(){
        $("#wsdlOption option:eq(0)").prop("selected",true);
        $("#soapResp").text('').removeClass('prettyprinted');
    });
})