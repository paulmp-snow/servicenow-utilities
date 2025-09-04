// ============= ARGUMENTS =============== //
// 1) The name of the root table in the    //
//    hierarchy you are searching. If you  //
//    suspect there may be orphaned rec-   //
//    ords from the sys_dictionary table,  //
//    then you would specify sys_metadata  //
//    as the root table.                   //
// 2) An option encoded query string to    //
//    narrow down the search. You might    //
//    specify 'sys_scope=12345' to rest-   //
//    rict the search to a certain scoped  //
//    app, where '12345' is the Sys ID of  //
//    that application.                    //
// 3) Whether or not to delete the orphan  //
//    records found by the script. If set  //
//    to false, no records will be delet-  //
//    ed. If set to true, orphans found by //
//    the script will be deleted. It is    //
//    recommended to always run with this  //
//    set to false first, and verify the   //
//    results before deleting anything.    //
// ======================================= //
findOrphans('sys_connection', null, true);

// ============== WARNING ================ //
// Do not modify anything below this line! //
// ======================================= //
function findOrphans(table, query, remove) {
    GlideTransaction.get().setAllowExcessiveLogging(true);
    if (gs.getCurrentScopeName() != 'rhino.global') {
        gs.info("This script must be run in the global scope. Please switch your scope and try again.");
        return;
    }

    var orphanCount = 0, removedCount = 0;
    var gr = new GlideRecord(table);
    if (query !== null) {
        gs.info("Querying " + table + " with encoded query: " + query);
        gr.addEncodedQuery(query);
    } else gs.info("Querying all rows on " + table);

    gr.query();
    gr.setWorkflow(false);
    while(gr.next()) {
        if(isOrphan(gr)) {
            gs.info("Found orphan on " + table + " (Class: " + gr.sys_class_name + " - Sys ID: " + gr.sys_id + ")");
            orphanCount++;
            if (remove === true) {
                gs.info("Removing orphan");
                gr.sys_class_name = table;
                gr.update();
                gr.deleteRecord();
                removedCount++;
            }
        }
    }

    gs.info("Total orphans found: " + orphanCount);
    gs.info("Total orphans removed: " + removedCount);
}

function isOrphan(gr) {
    if(gr.sys_class_name == null || gr.sys_class_name == '') return false;
    var childClass = new GlideRecord(gr.sys_class_name);
    if(!childClass.isValid()) return true;
    childClass.get(gr.sys_id);
    return !childClass.isValidRecord();
}
