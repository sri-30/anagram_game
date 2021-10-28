import {words} from '../resources/words.js'
import {getRndInteger} from './random_num.js'

// Creates a hashmap containing letter counts for a string
let createWordMap = (word) => {
    var wordMap = new Map()
    word = word.split('')
    word.forEach((letter) => {
        if (!wordMap.get(letter)) {
            wordMap.set(letter, 0)
        }
        var currentNum = wordMap.get(letter)
        wordMap.set(letter, currentNum + 1)
    })
    return wordMap
}

// Verifys that the letter counts of each letter in word1 are less than or equal to those in word2
let verifyAnagram = (word1, word2) => {
    var wordMap1 = createWordMap(word1)
    var wordMap2 = createWordMap(word2)

    var isAnagram = true
    
    wordMap1.forEach((value, key) => {
        if (!wordMap2.get(key) || value > wordMap2.get(key)) {
            isAnagram = false
    }});

    return isAnagram
}

// Shuffles a string
let shuffle = (word) => {
    word = word.split('')
    for (let i = word.length-1; i > 0; i--) {
        var j = getRndInteger(0, i);
        var temp_char = word[j]
        word[j] = word[i]
        word[i] = temp_char
    }
    return word.join('');
}

// Gets a random 10 letter word from the word list
let generateAnagramLetters = () => {
    var index = Math.floor(Math.random() * words.length);
    var anagram = words[index]
    anagram = shuffle(anagram)
    return {anagram: anagram, originalWord: words[index]};
}

export {createWordMap, verifyAnagram, generateAnagramLetters, shuffle}