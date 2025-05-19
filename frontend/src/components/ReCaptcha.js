import React, { useCallback } from "react";
import { GoogleReCaptcha } from "react-google-recaptcha-v3"

const ReCaptchaComponent = ({
	onVerify = () => {},
	refreshReCaptcha = false
}) => {
	const onReCaptchaVerify = useCallback((token) => {
		if (token) {
			onVerify(token);
			return;
		}
	}, []);

	return (
		<GoogleReCaptcha
			onVerify={onReCaptchaVerify}
			refreshReCaptcha={refreshReCaptcha}
		/>
	);
}

export default ReCaptchaComponent;
