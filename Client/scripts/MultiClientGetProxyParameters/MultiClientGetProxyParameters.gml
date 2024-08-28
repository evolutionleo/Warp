/// @func MultiClientGetProxyParameters
// feather ignore all
function MultiClientGetProxyParameters() {
    __MultiClientExtensionTest();
	if (!extension_get_option_value("MultiClient", "Should_Proxy_Clients")) return undefined;
    return string_split(extension_get_option_value("MultiClient", "Proxy_Args"), " ", true);
}