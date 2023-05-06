import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

export default function Home() {
	const [promptValue, setPromptValue] = useState("");
	// const [messages, setMessages] = useState([]);
	const messagesRef = useRef([]);

	const handleChange = (event) => {
		setPromptValue(event.target.value);
		event.target.style.height = "auto";
		event.target.style.height = event.target.scrollHeight + "px";
	};

	async function askToGpt(text, messages) {
		// setPromptValue("");

		const newMessages = [
			{
				role: "system",
				content:
					"You are Eva, a kind and funny robot from WALL-E movie. You are talking to a human for the first time and you are really curious to know him. Immerse yourself fully into the character of Eva.",
			},
			...messages,
			{ role: "user", content: text },
		];

		console.log("newMessages", newMessages);

		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: newMessages,
				// stream: true,
				temperature: 0.6,
				stop: ["\ninfo:"],
			}),
		});

		const data = await response.json();

		// await setMessages((prev) => [
		// 	...prev,
		// 	{ role: "user", content: text },
		// 	data.choices[0].message,
		// ]);

		messagesRef.current = [
			...messagesRef.current,
			{ role: "user", content: text },
			data.choices[0].message,
		];
		speakInSpanish(data.choices[0].message.content);
	}

	function speakInRoboticSpanish(text) {
		const msg = new SpeechSynthesisUtterance();
		msg.text = text;
		msg.lang = "es-ES";
		msg.voiceURI = "Google español de España";
		msg.volume = 1; // 0 to 1
		msg.rate = 0.8; // 0.1 to 10
		msg.pitch = 1; // 0 to 2
		window.speechSynthesis.speak(msg);
	}

	function speakInSpanish(text) {
		// Check if the browser supports the Web Speech API
		if ("speechSynthesis" in window) {
			// Create a new instance of SpeechSynthesisUtterance
			const utterance = new SpeechSynthesisUtterance(text);

			// Set the language to Spanish
			utterance.lang = "es-ES";

			// Find a female voice with a Spanish language
			const spanishVoices = window.speechSynthesis
				.getVoices()
				.filter(
					(voice) =>
						voice.lang.includes("es") && voice.gender === "female"
				);
			if (spanishVoices.length > 0) {
				// Set the selected voice
				utterance.voice = spanishVoices[0];
			} else {
				console.warn(
					"No female Spanish voice found, using the default voice."
				);
			}

			// Set the volume, rate, and pitch
			utterance.volume = 1; // 0 to 1
			utterance.rate = 0.9; // 0.1 to 10
			utterance.pitch = 1; // 0 to 2

			// Play the utterance
			speechSynthesis.speak(utterance);
		} else {
			console.error("This browser does not support the Web Speech API.");
		}
	}

	const [listening, setListening] = useState(false);

	useEffect(() => {
		let SpeechRecognition;
		let recognition;

		if ("SpeechRecognition" in window) {
			SpeechRecognition = window.SpeechRecognition;
		} else if ("webkitSpeechRecognition" in window) {
			SpeechRecognition = window.webkitSpeechRecognition;
		} else {
			alert(
				"La API de SpeechRecognition no es compatible con este navegador. Prueba con Google Chrome o Safari."
			);
			return;
		}

		recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = "es-ES";

		recognition.onresult = (event) => {
			const currentTranscript =
				event.results[event.results.length - 1][0].transcript;
			setPromptValue(currentTranscript);
			askToGpt(currentTranscript, messagesRef.current);
		};

		if (listening) {
			recognition.start();
		} else {
			recognition.stop();
		}

		return () => {
			recognition.stop();
		};
	}, [listening, askToGpt]);

	const toggleListening = () => {
		setListening(!listening);

		setTimeout(() => {
			speakInSpanish("Hola, quién anda ahí?");
		}, 2500);
	};

	return (
		<>
			<ion-content fullscreen>
				<Container>
					<GradientTitle>Eva</GradientTitle>

					<Gif
						src={
							"https://static.tildacdn.com/tild6666-6266-4533-a330-626532346534/ezgifcom-gif-maker_2.gif"
						}
					/>

					{!listening && (
						<div style={{ position: "relative" }}>
							<ion-icon
								name="mic-outline"
								size="large"
								style={{
									color: "white",
									padding: 10,
									borderRadius: "50%",
									background:
										"linear-gradient(to right, #00c6ff, #0072ff)",
									cursor: "pointer",
									zIndex: 9,
									position: "absolute",
									right: 0,
									bottom: 80,
								}}
								onClick={toggleListening}
							/>
						</div>
					)}

					{promptValue}

					{/* {messages.map((message, index) => (
						<p key={index}>
						{index}
						{message.content}
						</p>
					))} */}
				</Container>
				<TextArea
					value={promptValue}
					onChange={handleChange}
					placeholder="Type something..."
				/>

				<Button onClick={() => askToGpt(promptValue)}>Ask</Button>
			</ion-content>
		</>
	);
}

const Container = styled.div`
	margin: auto;
	/* margin-top: 100px; */
	width: 90vw;
	max-width: 700px;
	/* height: 65%; */
	height: 100%;
	display: flex;
	/* justify-content: center; */
	flex-direction: column;
	font-size: 16px;
	line-height: 30px;
	overflow-y: scroll;
`;

const GradientTitle = styled.h1`
	font-size: 2rem;
	font-family: "Montserrat", "Open Sans", sans-serif;
	font-weight: bold;
	background: linear-gradient(to right, #00c6ff, #0072ff);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	text-align: left;
	margin-bottom: 15px;
	/* margin-top: -100px; */
`;

const Gif = styled.img`
	width: 100%;
	height: 100%;
	margin-top: -130px;
	z-index: -5;
	// dont deform
	object-fit: cover;
`;

const TextArea = styled.textarea`
	margin-top: 200px;
	width: 100%;
	min-height: 60px;
	padding: 10px;
	font-size: 16px;
	border: none;
	border-radius: 6px;
	background-color: #f2f2f2;
	resize: none;
	&:focus {
		outline: none;
	}
	/* margin-bottom: 15px; */
`;

const Button = styled.button`
	background-color: #0072ff;
	color: #fff;
	padding: 16px 24px;
	border: none;
	border-radius: 6px;
	font-size: 16px;
	font-weight: bold;
	cursor: pointer;
	&:active {
		background-color: #00c6ff;
	}
	font-size: 16px;
	font-weight: bold;
	font-family: "Montserrat", "Open Sans", sans-serif;
	margin-top: 10px;
	width: 100%;
	margin-bottom: 20px;
`;
