const searchButton = document.getElementById("search_button");
const url = "https://api.dictionaryapi.dev/api/v2/entries/en/word";

const wordElement = document.querySelector(".result .word h3");
const detailsElement = document.querySelector(".result .details p");
const meaningElement = document.querySelector(".word_meaning");
const exampleElement = document.querySelector(".word_example");

const sound = document.getElementById("sound");
const soundButton = document.querySelector(".word button");

const favouriteButton = document.querySelector(".favourite_button");
let favouriteWords = JSON.parse(localStorage.getItem("favouriteWords")) || [];

searchButton.addEventListener("click", async () => {
    const word = document.getElementById('input').value.trim();

    if (word) {
        try {
            const data = await fetchWordData(word);
            displayWordData(data, word);

        
            const apiUrl = "https://673612775995834c8a954fe2.mockapi.io/api/v1/favourites";
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch favorites from Mock API");
            }

            const favouriteWords = await response.json();
            const isFavorite = favouriteWords.some(fav => fav.word === word);

            if (isFavorite) {
                favouriteButton.classList.add("in_favourites");
            } else {
                favouriteButton.classList.remove("in_favourites");
            }

        } catch (error) {
            console.error("Error fetching the word data or checking favorites:", error);
        }
    } else {
        alert("Please enter a word to search!");
    }
});

async function fetchWordData(word) {
    const getUrl = url.replace("word", word);
    const response = await fetch(getUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${word}`);
    }

    const data = await response.json();
    return data;
}

function displayWordData(data, word) {
    wordElement.innerText = word;
    detailsElement.innerText = data[0].meanings[0].partOfSpeech || 'N/A';
    meaningElement.innerText = data[0].meanings[0].definitions[0].definition || 'No definition available';
    exampleElement.innerText = getExample(data) || 'No Example Available';

    if (data[0].phonetics[0]?.audio) {
        sound.src = data[0].phonetics[0].audio;
        soundButton.onclick = () => {
            sound.play();
        }
    }

    if (favouriteWords.includes(word)) {
        favouriteButton.classList.add("in_favourites");
    } else {
        favouriteButton.classList.remove("in_favourites");
    }

    favouriteButton.onclick = () => toggleFavorite(word);
}

function getExample(data) {
    let example = "No example available.";

    for (let meaning of data[0]?.meanings || []) {
        for (let definition of meaning.definitions || []) {
            if (definition.example) {
                example = definition.example;
                break;
            }
        }
        if (example !== "No example available.") {
            break;
        }
    }

    return example;
}

async function toggleFavorite(word) {
    const favoriteIndex = favouriteWords.findIndex(item => item.word === word);

    if (favoriteIndex !== -1) {
        const wordId = favouriteWords[favoriteIndex].id;
        favouriteWords = favouriteWords.filter(item => item.word !== word);
        favouriteButton.classList.remove("in_favourites");

        try {
            await postFavoriteAction('DELETE', wordId);
        } catch (error) {
            console.error("Failed to remove word from favourites:", error);
        }
    } else {
        const wordData = { word };

        try {
            const newWord = await postFavoriteAction('POST', wordData);
            favouriteWords.push(newWord);
            favouriteButton.classList.add("in_favourites");
        } catch (error) {
            console.error("Failed to add word to favorites:", error);
        }
    }

    localStorage.setItem('favouriteWords', JSON.stringify(favouriteWords));
}

async function postFavoriteAction(method, wordData) {
    const apiUrl = "https://673612775995834c8a954fe2.mockapi.io/api/v1/favourites";

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(wordData) : undefined,
    };

    try {
        const response = await fetch(apiUrl + (method === 'DELETE' ? `/${wordData}` : ''), options);
        if (!response.ok) {
            throw new Error(`Failed to ${method} word to favorites`);
        }

        if (method === 'POST') {
            const newWord = await response.json();
            return newWord;
        } else if (method === 'DELETE') {
            await response.json();
        }
    } catch (error) {
        console.error("Error with favorite action", error);
    }
}


function checkFavoriteWords(word) {
    let favouriteWord = JSON.parse(localStorage.getItem("favouriteWords")) || [];
     if (favouriteWords.includes(word)) {
         favouriteButton.classList.add("in_favourites");
         } else { favouriteButton.classList.remove("in_favourites");

          }
         }