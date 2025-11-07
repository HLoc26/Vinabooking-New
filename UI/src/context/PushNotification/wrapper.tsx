import { PushNotification } from "../../components/ui/PushNotification";
import { usePushNotificationContext } from "./hook";

const PushNotificationWrapper = () => {
	const { notifications, removeNotification } = usePushNotificationContext();
	return <PushNotification notifications={notifications} onClose={removeNotification} />;
};

export default PushNotificationWrapper;
