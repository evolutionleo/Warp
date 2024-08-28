/// @func MultiClientGetNumberOfClients
// feather ignore all
function MultiClientGetNumberOfClients() {
    __MultiClientExtensionTest();
    return extension_get_option_value("MultiClient", "Number_Of_Clients");
}