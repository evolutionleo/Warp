/// @func MultiClientGetProxyPath
// feather ignore all
function MultiClientGetProxyPath() {
    __MultiClientExtensionTest();
	if (!extension_get_option_value("MultiClient", "Should_Proxy_Clients")) return undefined;
    return extension_get_option_value("MultiClient", "Proxy_Path");
}