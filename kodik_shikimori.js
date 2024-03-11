// ==UserScript==
// @name Add Watch Online Button with Video and Title Tracking
// @namespace http://tampermonkey.net/
// @version 0.1
// @description Добавляет кнопку "Смотреть онлайн" с видеоплеером ��а странице аниме на Shikimori и отслеживает з��головок страницы
// @author Your Name
// @match https://shikimori.one/animes/*
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    let currentPageTitle = document.title;
    let watchOnlineButtonAdded = false; // Флаг для отслеживания добавления кнопки
    let videoIframe = null;

    // Функция добавления "Смотреть онлайн" кнопки с видеоплеером
    function addWatchOnlineButton() {
        // Находим целевой элемент с классом "b-add_to_list planned"
        const targetElement = document.querySelector('.b-add_to_list.planned');
        if (targetElement && !watchOnlineButtonAdded) {
            // Создаем кнопку "Смотреть онлайн"
            const watchOnlineButton = document.createElement('button');
            watchOnlineButton.textContent = 'Смотреть онлайн';
            watchOnlineButton.classList.add('b-link_button');
            watchOnlineButton.addEventListener('click', function() {
                if (!videoIframe) {
                    videoIframe = document.createElement('iframe');
                    videoIframe.src = "//kodik.cc/find-player?shikimoriID=" + getShikimoriID();
                    videoIframe.width = '610px';
                    videoIframe.height = '370px';
                    videoIframe.frameBorder = 0;
                    videoIframe.setAttribute('allowfullscreen', '');
                    videoIframe.setAttribute('allow', 'autoplay *; fullscreen *');


                    // Вставляем iframe в <div class="c-about">
                    const descriptionElement = document.querySelector('.c-about');
                    if (descriptionElement) {
                        descriptionElement.appendChild(videoIframe);
                    }

                    watchOnlineButton.textContent = 'Закрыть';
                    watchOnlineButtonAdded = true; // Устанавливаем флаг в true после добавления кнопки
                } else {
                    videoIframe.remove();
                    videoIframe = null;
                    watchOnlineButton.textContent = 'Смотреть онлайн';
                    watchOnlineButtonAdded = false; // Сбрасываем флаг при закрытии видеоплеера
                }
            });

            // Вставляем кн��пку после целевого ��лемента
            targetElement.parentNode.insertBefore(watchOnlineButton, targetElement.nextSibling);
        }
    }

    // Функция извлечения Shikimori ID из URL
    function getShikimoriID() {
        const urlParts = window.location.href.split('/');
        const shikimoriID = urlParts[urlParts.length - 1].split('-')[0];
        return shikimoriID;
    }

    // Добавляем кнопку при загрузке страницы
    addWatchOnlineButton();

    // Отслеживаем изменени�� заголо��ка страницы для повторного добавления кнопки
    setInterval(function() {
        if (document.title !== currentPageTitle) {
            currentPageTitle = document.title;
            if (videoIframe) {
                videoIframe.remove();
                videoIframe = null;
                watchOnlineButtonAdded = false; // Сбрасываем флаг при уд��лении видеоплеера
            }
            addWatchOnlineButton();
        }
    }, 1000); // Проверка каждую секунду
})();
