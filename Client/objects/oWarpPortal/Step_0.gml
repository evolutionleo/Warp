/// @desc this entity is entirely server-side

// re-color the portal
switch(portal_type) {
	case "Entrance":
		image_index = 1
		break
	case "Exit":
		image_index = 0
		break
	case "Both":
		image_index = 2
		break
}