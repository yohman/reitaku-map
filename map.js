let map; // グローバル変数として定義

function init() {

    let slideIndex = 1;
    let slideInterval;
     //showSlides(slideIndex);

    function plusSlides(n) {
        showSlides(slideIndex += n);
        resetSlideInterval();
    }

    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        if (slides.length === 0) return; // スライドが存在しない場合は処理をスキップ
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";  
        }
        slides[slideIndex-1].style.display = "block";  
    }

    function resetSlideInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            plusSlides(1);
        }, 3000); // 3秒ごとにスライドを変更
    }

    // 初期スライド表示とインターバル設定
    showSlides(slideIndex);
    resetSlideInterval();
    
    // 矢印ボタンのクリックイベントを設定
    document.addEventListener('click', (event) => {
        if (event.target.matches('.prev')) {
            plusSlides(-1);
        } else if (event.target.matches('.next')) {
            plusSlides(1);
        }
    });
    
    // ...existing code...
    let lastClickedMarker = null; // 最後にクリックしたマーカーを追跡
    // 言語切り替え設定
     let currentLanguage = 'japanese'; // 初期言語
    function setLanguage(language) {
        currentLanguage = language;
        regenerateLeftPanel(); // 左パネルを再生成
        // if (lastClickedMarker) {
        //      lastClickedMarker.getElement().click(); // 最後にクリックしたマーカーを再クリックして更新
        // }
        //  updateTextContent();
    }

    function updateTextContent() { // ここを追加
        const elements = document.querySelectorAll('[data-japanese], [data-english]');
        elements.forEach(element => {
            if (currentLanguage === 'japanese') {
                element.textContent = element.getAttribute('data-japanese');
            } else {
                element.textContent = element.getAttribute('data-english');
            }
        });
    }

    // 言語切り替えボタンを動的に追加
    const buttonContainer = document.createElement('div');
    buttonContainer.style.position = 'absolute';
    buttonContainer.style.top = '10px';
    buttonContainer.style.left = '10px';
    buttonContainer.style.zIndex = '9999';
    buttonContainer.innerHTML = `
        <button id="japanese-button">日本語</button>
        <button id="english-button">English</button>
        <button id="add-geojson-layer-button">3D on</button>
        <button id="remove-geojson-layer-button">3D off</button>
    `;
    document.body.appendChild(buttonContainer);

    function updatePositions() {
        const leftPanel = document.getElementById('left-panel');
        const mapStyle = document.getElementById('map-style');
        const markerFilterDropdown = document.getElementById('marker-filter-dropdown');
    
        if (window.innerWidth <= 767) {
            const leftPanelTop = leftPanel.getBoundingClientRect().top;
            mapStyle.style.top = `${leftPanelTop}px`;
            markerFilterDropdown.style.top = `${leftPanelTop}px`;
        } else {
            mapStyle.style.top = '10px';
            markerFilterDropdown.style.top = '9px';
        }
    }
    
    // 初期設定
    updatePositions();
    
    // ウィンドウのリサイズ時に実行
    window.addEventListener('resize', updatePositions);

    // ボタンクリックイベントを登録
    document.getElementById('japanese-button').addEventListener('click', () => setLanguage('japanese'));
    document.getElementById('english-button').addEventListener('click', () => setLanguage('english'));
    document.getElementById('add-geojson-layer-button').addEventListener('click', addGeoJsonLayer);
    document.getElementById('remove-geojson-layer-button').addEventListener('click', removeGeoJsonLayer);

    // 初期メッセージを設定
      document.getElementById('info').innerHTML = '言語の選択とアイコンをクリックまたはタップして詳細を表示';
        const element = document.getElementById('info');

        // 要素の位置を少し下げる
        element.style.marginTop = '20px';  // 20px 下げる

    // すべてのマーカーの平均緯度と経度を計算
    let latSum = 0;
    let lonSum = 0;

    




    // Mapboxのアクセストークン
    mapboxgl.accessToken = 'pk.eyJ1IjoieW9oamFwYW4iLCJhIjoiY2xnYnRoOGVmMDFsbTNtbzR0eXV6a2IwZCJ9.kJYURwlqIx_cpXvi66N0uw';

    // データを取得
    let rows = data.main.values;
    let markers = [];
    initMap();

    // filter rows based on marker-filter dropdown
    const dropdown = document.getElementById('marker-filter');
    dropdown.addEventListener('change', function() {
        const category = parseInt(dropdown.value);
        console.log(category);
        if (category == -1) {
            console.log('all');
            rows = data.main.values;
        } else {
            console.log('filtered');
            rows = data.main.values.filter(row => parseInt(row[1]) === category);
        }
        
        initMap();
    });

    console.log(rows);

    // current marker idの変数
    let currentMarkerId = null;

    function initMap() {
        console.log('initMap');
        console.log(rows)
        // 既存のマーカーを削除
        markers.forEach(marker => marker.remove());
        markers = [];
        // lat,lonがある行のみを対象にする
        latSum = 0;
        lonSum = 0;
        rows.forEach((row, index) => {
            
            const [id, category, name, englishName, lat, lon, japaneseDescription, englishDescription, link, hashutagu, linkname,numphotos] = row;
            if (!lat || !lon) return;
            console.log(lat, lon);
            if (lat && lon) { // lat, lonが存在する場合のみ加算
                latSum += parseFloat(lat);
                lonSum += parseFloat(lon);
            }
        });

        // 中心座標を計算
        const centerlat = latSum / rows.length;
        const centerlon = lonSum / rows.length;

        console.log(centerlat, centerlon);

        if (!map) { // mapが存在しない場合のみ初期化
            map = new mapboxgl.Map({
                container: 'map',
                center: [centerlon, centerlat],
                //style: 'mapbox://styles/mapbox/satellite-v9',
                style: 'mapbox://styles/mapbox/streets-v11',
                zoom: 15
            });
        } else {
            map.setCenter([centerlon, centerlat]);
        }
        // document.getElementById('normal-map-btn').addEventListener('click', () => {
        //     map.setStyle('mapbox://styles/mapbox/streets-v11');
        // });
        
        // document.getElementById('satellite-map-btn').addEventListener('click', () => {
        //     map.setStyle('mapbox://styles/mapbox/satellite-v9');
        // });

        const mapDropdown = document.getElementById('map-style-dropdown');
        mapDropdown.addEventListener('change', () => {
            const year = mapDropdown.value;
            let style;

            switch (year) {
                case 'normal':
                    style = 'mapbox://styles/mapbox/streets-v11';
                    break;
                case '2023':
                    style = 'mapbox://styles/mapbox/satellite-v9';
                    break;

                case '1974':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://cyberjapandata.gsi.go.jp/xyz/gazo1/{z}/{x}/{y}.jpg"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '1961':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://cyberjapandata.gsi.go.jp/xyz/ort_old10/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '1979':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://cyberjapandata.gsi.go.jp/xyz/gazo2/{z}/{x}/{y}.jpg"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '1984':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://cyberjapandata.gsi.go.jp/xyz/gazo3/{z}/{x}/{y}.jpg"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '1987':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://cyberjapandata.gsi.go.jp/xyz/gazo4/{z}/{x}/{y}.jpg"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '2008':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://maps.gsi.go.jp/xyz/nendophoto2008/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '2012':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://maps.gsi.go.jp/xyz/nendophoto2012/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '2014':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://maps.gsi.go.jp/xyz/nendophoto2014/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                case '2019':
                    style = {
                    "version": 8,
                    "sources": {
                        "gsi": {
                        "type": "raster",
                        "tiles": [
                            "https://maps.gsi.go.jp/xyz/nendophoto2019/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                        }
                    },
                    "layers": [
                        {
                        "id": "gsi-layer",
                        "type": "raster",
                        "source": "gsi",
                        "minzoom": 0,
                        "maxzoom": 18
                        }
                    ]
                    };
                    break;
                default:
                    style = 'mapbox://styles/mapbox/streets-v11';
            }

            map.setStyle(style);
        });

        

        // マーカーをマップに追加
        rows.forEach((row, index) => {
            const [id, category, jName, eName, lat, lon, jDescription, eDescription,link,hashutagu,linkname,numphotos] = row;
            
            var rphotos = ''; // Object to store dynamically created variables

            for (let i = 1; i <= numphotos; i++) {
                rphotos+=`<div class="mySlides fade"><img src="images/reitaku-${id}-${i}.jpg" style="width:100%;height:350px;object-fit:cover"></div> `;
            }

            // console.log(rphotos);
            // カスタムマーカー用のHTML要素を作成
            const customMarker = document.createElement('div');
            if (category == 4) {
                customMarker.style.backgroundImage = `url(images/reitaku-ex-1.jpg)`;
                customMarker.style.width = '25px';
                customMarker.style.height = '25px';
                customMarker.style.zIndex = index;
                customMarker.style.borderRadius = '50%';
            } 
            else if (category == 5){
                customMarker.style.backgroundImage = `url(images/reitaku-ex-2.jpg)`;
                customMarker.style.width = '25px';
                customMarker.style.height = '25px';
                customMarker.style.zIndex = index;
                customMarker.style.borderRadius = '0%';
            }
            else if (category == 0) {
                customMarker.style.backgroundImage = `url(images/reitaku-${id}-1.jpg)`;
                customMarker.style.width = '40px';
                customMarker.style.height = '40px';
                customMarker.style.zIndex = '1000';
                customMarker.style.borderRadius = '50%';
            }
            else {
                customMarker.style.backgroundImage = `url(images/reitaku-${id}-1.jpg)`;
                customMarker.style.width = '40px';
                customMarker.style.height = '40px';
                customMarker.style.zIndex = index;
                customMarker.style.borderRadius = '50%';
            }
            // customMarker.style.backgroundImage = `url(images/reitaku-${id}-1.jpg)`;
            // customMarker.style.borderRadius = '50%';
            // customMarker.style.border = `2px solid ${getCategoryColor(category)}`;
            customMarker.style.backgroundSize = 'cover';
            customMarker.style.cursor = 'pointer';
            customMarker.style.border = `2px solid white`;
            customMarker.style.border = `0 0 0 2px white, 0 0 0 4px white`;

            // マーカーをマップに追加
            const marker = new mapboxgl.Marker({ element: customMarker })
                .setLngLat([parseFloat(lon), parseFloat(lat)])
                .addTo(map);

            markers.push(marker);
            // Add hover title tooltip
            customMarker.title = currentLanguage === 'japanese' ? jName : eName;

            // クリックイベントで左パネルをトグル表示
            marker.getElement().addEventListener('click', () => {
                
                // consoleでmarkerのidを表示
                console.log(id);
                
                //currentMarkerIdにidを代入
                currentMarkerId = id;

                if (lastClickedMarker === marker) {
                    document.getElementById('info').innerHTML = '言語を選択とマーカーをクリックまたはタップして詳細を表示';
                    lastClickedMarker = null;
                } else {
                    const description = currentLanguage === 'japanese' ? jDescription : eDescription;
                    const name = currentLanguage === 'japanese' ? jName : eName;
                    document.getElementById('info').innerHTML = `
                        <h2>${name}</h2>
                        <p>${description}</p>
                        <div class="slideshow-container">
                            ${rphotos}
                            <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                            <a class="next" onclick="plusSlides(1)">&#10095;</a>
                        </div>
                        <a href="${link}" target="_blank">${linkname}</a>
                    `;
                    lastClickedMarker = marker;
                }
            });
        });

        
    }
    // create a function that regenerates the left panel based on the current marker id
    function regenerateLeftPanel() {
        // find the row that matches the current marker id
        const row = rows.find(row => row[0] === currentMarkerId);
        if (!row) return; // if no row is found, exit the function

        const [id, category, jName, eName, lat, lon, jDescription, eDescription,link,hashutagu,linkname,numphotos] = row;
        var rphotos = ''; // Object to store dynamically created variables

        for (let i = 1; i <= numphotos; i++) {
            rphotos+=`<div class="mySlides fade"><img src="images/reitaku-${id}-${i}.jpg" style="width:100%;height:350px;object-fit:cover"></div> `;
        }

        const description = currentLanguage === 'japanese' ? jDescription : eDescription;
        const name = currentLanguage === 'japanese' ? jName : eName;
        document.getElementById('info').innerHTML = `
            <h2>${name}</h2>
            <p>${description}</p>
            <div class="slideshow-container">
                ${rphotos}
                <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                <a class="next" onclick="plusSlides(1)">&#10095;</a>
            </div>
            <a href="${link}" target="_blank">${linkname}</a>
        `;
    }

    // 初期設定
    initMap();

    // filter rows based on marker-filter dropdown
    const markerFilterDropdown = document.getElementById('marker-filter');
    markerFilterDropdown.addEventListener('change', function() {
        const category = parseInt(markerFilterDropdown.value);
        console.log(category);
        if (category == -1) {
            console.log('all');
            rows = data.main.values;
        } else {
            console.log('filtered');
            rows = data.main.values.filter(row => parseInt(row[1]) === category);
        }
        
        initMap();
    });

}

// カテゴリごとに色を取得するヘルパー関数
// function getCategoryColor(category) {
//     switch (parseInt(category)) {
//         case 0: return '#FFFF33'; // 黄色系
//         case 1: return '#33FF57'; // 緑系
//         case 2: return '#3357FF'; // 青系
//         case 3: return '#FF33FF'; // ピンク系
//         case 4: return '#FF5733'; // オレンジ系
//         case 5: return '#33FFFF'; // シアン系
//         default: return '#ffffff'; // 白系
//     }
// }

function addGeoJsonLayer() {
    map.addSource('geojson-data', {
        type: 'geojson',
        data: 'data/map.geojson'
    });

    map.easeTo({
        pitch: 60, // 地図の傾斜角度を設定
        bearing: -17.6, // 地図の回転角度を設定
        duration: 1000 // アニメーションの持続時間を設定
    });

    map.addLayer({
        id: 'geojson-layer',
        type: 'fill-extrusion',
        source: 'geojson-data',
        paint: {
            'fill-extrusion-color': '#007cbf',
            'fill-extrusion-height': 20,
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.6
        }
    });
}

function removeGeoJsonLayer() {
    map.removeLayer('geojson-layer');
    map.removeSource('geojson-data');
}