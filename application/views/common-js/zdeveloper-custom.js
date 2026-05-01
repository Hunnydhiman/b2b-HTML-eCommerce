function RequestForQuote(selProdId, rfqId)
{
    if (isUserLogged() == 0) {
        loginPopUpBox();
        return false;
    }

    var parent_id = 0;
    if (rfqId != '' && rfqId != undefined) {
        parent_id = rfqId;
    }
    var data = 'parent_id=' + parent_id;
    if (typeof selProdId != 'undefined') {
        $(".cart-tbl").find("input").each(function (e) {
            if (($(this).val() > 0) && (!$(this).closest("td").siblings().hasClass("cancelled--js"))) {
                data = data + '&' + $(this).attr('lang') + "=" + $(this).val();
            }
        });
    }

    fcom.ajax(fcom.makeUrl('RequestForQuotes', 'form', [selProdId]), data, function (t) {
        fcom.updateFaceboxContent(t, 'faceboxWidth productQuickView');
    });
}

function rfqForService(selProdId, rfqId)
{
    if (isUserLogged() == 0) {
        loginPopUpBox();
        return false;
    }

    var parent_id = 0;
    if (rfqId != '' && rfqId != undefined) {
        parent_id = rfqId;
    }
    var data = 'parent_id=' + parent_id;
    fcom.ajax(fcom.makeUrl('RequestForQuotes', 'formForService', [selProdId]), data, function (t) {
        fcom.updateFaceboxContent(t, 'faceboxWidth productQuickView');
    });
}

function setupRequestForQuote(frm)
{
    if ($("input[name='rfq_documents']").length > 0 && $("input[name='group_id']").val() < 1) {
        $('#document-fld-js .document-error').remove();
        errorHtml = '<ul class="document-error"><li><a href="javascript:void(0);">Document is mandatory</a></li></ul>';
        $('#document-fld-js input[name="rfq_documents"]').after(errorHtml);
        return false;
    }
    /* VALIDATION FOR ATTACHED SERVICES DOCUMENTS */
    if ($("input[name='rfq_documents_services']").length > 0) {
        var errorCount = 0
        $("input[name='rfq_documents_services']").each(function (index, element) {
            if ($(element).siblings('.service_doc_group').val() < 1) {
                errorCount++;
            }
        });

        if (errorCount > 0) {
            $.mbsmessage('Document is mandatory', true, 'alert--danger');
            return false;
        }

    }
    /* ] */

    if (!$(frm).validate()) {
        return false;
    }

    var data = fcom.frmData(frm);
    fcom.ajax(fcom.makeUrl('RequestForQuotes', 'setup'), data, function (ans) {
        var ans = JSON.parse(ans);
        if (ans.status == 1) {
            $.mbsmessage(ans.msg, true, 'alert--success');
            $(document).trigger('close.facebox');
        } else {
            $.mbsmessage(ans.msg, true, 'alert--danger');
        }
    });
}

function uploadDocument(serviceId = 0)
{
    serviceId = parseInt(serviceId);
    var groupId = $("input[name='group_id']").val();
    var fld = 'input[name="rfq_documents"]';
    if (serviceId > 0) {
        groupId = $('input[name="service_group_id[' + serviceId + ']"]').val();
        fld = '.service-doc_' + serviceId + '--js input[name="rfq_documents_services"]';
    }
    var data = new FormData();
    data.append('rfq_document', $(fld)[0].files[0]);
    data.append('group_id', groupId);
    data.append('selprod_id', serviceId);
    $.mbsmessage(langLbl.processing, false, 'alert--process');
    $.ajax({
        url: fcom.makeUrl('RequestForQuotes', 'uploadDocumentForSeller'),
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        success: function (t) {
            var ans = $.parseJSON(t);
            if (ans.status == 1) {
                $('#document-fld-js .document-error').remove();
                $(fld).val('');
                if (serviceId > 0) {
                    $('input[name="service_group_id[' + serviceId + ']"]').val(ans.group_id);
                } else {
                    $("input[name='group_id']").val(ans.group_id);
                }
                getTempUploadedDocuments(ans.group_id, ans.msg, serviceId);
            } else {
                $(document).trigger('close.mbsmessage');
                $.mbsmessage(ans.msg, true, 'alert--danger');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Error Occurred.");
        }
    });
}

function getTempUploadedDocuments(groupId, msg, serviceId = 0) {
    serviceId = parseInt(serviceId);
    let data = 'group_id=' + groupId + '&service_id=' + serviceId;
    fcom.ajax(fcom.makeUrl('RequestForQuotes', 'getTempUploadedDocuments'), data, function (res) {
        var divId = '#uploaded-documents-js';
        if (serviceId > 0) {
            divId = '#uploaded-documents-js_' + serviceId;
        }
        $(divId).html(res);
        if (msg != '' && msg != undefined) {
            $(document).trigger('close.mbsmessage');
            $.systemMessage(msg, 'alert--success');
        }
    });
}

function removeRfqDocument(afileId, serviceId = 0) {
    let data = '&afile_id=' + afileId
    fcom.ajax(fcom.makeUrl('RequestForQuotes', 'removeTempDocument'), data, function (ans) {
        var ans = JSON.parse(ans);
        if (ans.status == 1) {
            $('#document-js-' + afileId).remove();
            $.mbsmessage(ans.msg, true, 'alert--success');
            if (serviceId > 0 && $('#uploaded-documents-js_' + serviceId + ' span').length < 1) {
                $("input[name='service_group_id[" + serviceId + "]']").val('');
            } else if ($('#uploaded-documents-js span').length < 1) {
                $("input[name='group_id']").val('');
            }
        } else {
            $.mbsmessage(ans.msg, true, 'alert--danger');
        }
    });
}
