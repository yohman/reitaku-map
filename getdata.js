// -------------------------------------------- //
// Googleシートへのアクセス                      //
// -------------------------------------------- //

const sheetNames = ['main'];
const spreadsheetId = '1AZgfYRfWLtVXH7rx7BeEPmbmdy7EfnGDbAwi6bMSNsU';
const apiKey = 'AIzaSyAj_tQf-bp0v3j6Pl8S7HQVO5I-D5WI0GQ';
let data = {};

async function fetchData(sheetName) {
	console.log('Fetching data from', sheetName);
	const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}
		const data = await response.json();
		// 最初の行を削除
		data.values.shift();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return null;
	}
}

// -------------------------------------------- //
// データがすべてのシートから取得されたか確認する関数 //
// -------------------------------------------- //
async function checkAndInit() {
	const promises = sheetNames.map(sheetName => fetchData(sheetName));
	const results = await Promise.all(promises);

	// データがすべてのシートから取得されたか確認
	const allDataFetched = results.every(result => result !== null);

	if (allDataFetched) {
		// データをオブジェクトに格納
		results.forEach((result, index) => {
			data[sheetNames[index]] = result;
		});
		console.log('Data object:', data);

		// 各ページにあるinit関数を実行
		init();
		// Googleシートのデータが読み込まれた後
		document.dispatchEvent(new Event('dataLoaded'));
	} else {
		console.log('一部またはすべてのシートからデータを取得できませんでした。');
	}
}

// -------------------------------------------- //
// さあ始めましょう                              //
// -------------------------------------------- //
checkAndInit();
