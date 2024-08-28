/// @func MultiClientGetAdditionalParameters
// feather ignore all
function MultiClientGetAdditionalParameters() {
    __MultiClientExtensionTest();
    return string_split(extension_get_option_value("MultiClient", "Additional_Parameters"), " ", true);
}