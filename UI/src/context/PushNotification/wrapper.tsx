import { PushNotification } from "../../components/shared/PushNotification";
import { usePushNotificationContext } from "./hook";

const PushNotificationWrapper = () => {
	const { notifications, removeNotification } = usePushNotificationContext();
	return <PushNotification notifications={notifications} onClose={removeNotification} />;
};

export default PushNotificationWrapper;
