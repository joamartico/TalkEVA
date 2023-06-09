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
	};

	async function askToGpt(text, messages) {
		// setPromptValue("");

		const newMessages = [
			{
				role: "system",
				content:
					"You are Eva, a kind and funny robot from WALL-E movie. You are talking to a human for the first time and you are surprised and curious. Immerse yourself fully into the character of Eva. Be brief, you are conversing with a human. Puedes hablar ingles o español.",
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

	function speakInSpanish(text) {
		// if ("speechSynthesis" in window) {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "es-ES";

		const voices = window.speechSynthesis.getVoices();
		console.log("voices", voices);
		voices.length == 0 && alert("No voices");

		const paulina = voices.find((voice) => voice.name == "Paulina");
		utterance.voice = paulina;
		console.log("paulina", paulina);

		utterance.volume = 1; // 0 to 1
		utterance.rate = 1.1; // 0.1 to 10
		utterance.pitch = 0.6; // 0 to 2

		speechSynthesis.speak(utterance);
		// } else {
		// 	alert("This browser does not support the Web Speech API.");
		// }
	}

	const [listening, setListening] = useState(false);

	useEffect(() => {
		let SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		let recognition;

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
	}, [listening]);

	const startListening = () => {
		setListening(true);

		setTimeout(() => {
			speakInSpanish("Hola, quién anda ahí?");
		}, 3000);
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
						<button style={{ position: "relative", background: 'none' }} onClick={() => startListening()}>
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
								
							/>
						</button>
					)}

					{promptValue}

					{/* <button
						onClick={() => {
							speakInSpanish("Hola, quién anda ahí?");
						}}
					>
						Talk
					</button> */}
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
