/**
* Create Excel attachment for a record.
* @private
* @param {Object} data - values to be used in the template
* @param {GlideRecord} execRec - Report execution record
* @param {string} template - HTML template string
*/
createExcel: function(data, execRec, template) {
    try {

        Object.keys(data).forEach(function(key) {
            template = template.replaceAll("${" + key + "}", data[key]);
        });

        var html = [];
        html.push('<html xmlns:x="urn:schemas-microsoft-com:office:excel">');
        html.push("<head><xml><x:ExcelWorkbook>");
        html.push("<x:ExcelWorksheets><x:ExcelWorksheet>");
        html.push("<x:Name>Report</x:Name>");
        html.push("<x:WorksheetOptions><x:Panes/></x:WorksheetOptions>");
        html.push(
            "</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml></head>"
        );
        html.push("<body>" + template + "</body></html>");
        var attachment = new Attachment();
        attachment.write(
            "report_executions",
            execRec.getUniqueValue(),
            "GeneratedExcel_" + gs.now() + ".xls",
            "application/vnd.ms-excel",
            "\uFEFF," + html.join("")
        );
    } catch (err) {
        gs.error(
            "[Script Include - GenerateExcelUtils] createExcel error: " + err.message
        );
    }
}
