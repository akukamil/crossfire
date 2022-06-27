function start() {
	
	
    url = 'https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize'
    headers = {
        'Authorization': 'Bearer ' + 't1.9euelZrKysqZkIqbjpeWz8rLm56Tl-3rnpWazY_JmMyckJ2MkZGTl5GSyJDl8_dfDBlq-e9BcHBZ_N3z9x87Fmr570FwcFn8.axR_YLXIfp0lSVpq-OihVG3M3AGuiDfl5fAufOeVMOyYU5k0qYFcssaH9UK4C5zmA2nri8GW1ItjKaH3gv4yAQ',
    }

    data = {
		"text": "Привет!\nЯ Яндекс Спичк+ит.\nЯ могу превратить любой текст в речь.\nТеперь и в+ы - можете!",
		"lang": "ru-RU",
		"speed": 1,
		"voice": "alena",
		"emotion": "neutral"
	}
	
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize");

	xhr.setRequestHeader("Accept", "application/json");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onload = () => console.log(xhr.responseText);


	xhr.send(data);
		
	
	
}