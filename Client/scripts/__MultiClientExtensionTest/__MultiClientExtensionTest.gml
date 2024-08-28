/// feather ignore all
/// ignore
function __MultiClientExtensionTest() {
    static _test = (function() {
        if (extension_get_option_value("MultiClient", "Number_Of_Clients") == undefined) {
            show_error("Extension functions failed to fetch information!!!\nUsing an older version of LTS, or extension broken?", true);   
        }
    })();
}