$(function(){
    
    $("#btnSubmit").click(function(){
        var referenceWsdlUrl = $("#referenceWsdlOption").val(),  compareWsdlUrl =  $("#compareWsdlOption").val(),
            referenceSoapData = $("#referenceSoapData").val(), compareSoapData = $("#compareSoapData").val();
        $.post("/tools/diffCompare",{"referenceWsdlUrl":referenceWsdlUrl,"compareWsdlUrl":compareWsdlUrl,
                "referenceSoapData":referenceSoapData,"compareSoapData" :compareSoapData},function(data){
            $("#soapResp").html(data).removeClass('prettyprinted');
            prettyPrint();
        });
    });

    $("#btnReset").click(function(){
        $("#referenceWsdlOption option:eq(0), #compareWsdlOption option:eq(0)").prop("selected",true);
        $("#soapResp").text('').removeClass('prettyprinted');
    });
})