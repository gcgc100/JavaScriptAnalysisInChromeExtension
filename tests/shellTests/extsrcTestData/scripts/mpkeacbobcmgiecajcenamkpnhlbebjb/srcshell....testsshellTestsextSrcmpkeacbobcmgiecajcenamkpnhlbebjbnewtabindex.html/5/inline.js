
        //********************************
        //* Logo & Wallpaper fastloading *
        //********************************
        var config = JSON.parse(localStorage.getItem('FRAMEWORK_CONFIG_USER_LOCAL_596cdf55a6fde140027b23c6'));
        var fastload = JSON.parse(localStorage.getItem('FASTLOAD_WALLPAPER_596cdf55a6fde140027b23c6'))

        if (config && !config.newtab.logo.defaults.visible) {
            document.body.className = document.body.className.replace('logo-enabled', '');
        }

        if (config && !config.newtab.wallpapers.defaults.visible) {
            document.body.setAttribute('bg-white', true);
            document.querySelector('#module-search input').style.border = '1px solid #b0b0b0';
            document.querySelector('#module-search input').style.boxShadow = '0 1px 1px rgba(0,0,0,0.09)';
            document.querySelector('#module-search input').style.backgroundColor = '#fff';
        }

        if (fastload && fastload.info) {
            var url = fastload.info.cache_url || fastload.info.data_uri || fastload.info.image;
            var bgColor = fastload.info.bg_color || '';
            document.body.className = document.body.className.replace('wallpaper-loading', '');
            document.getElementById('layer-wallpapers-image').style.backgroundImage = 'url(' + url + ')';
            document.getElementById('layer-wallpapers-image').style.backgroundPosition = 'center ' + (fastload.info.v_align || 'center');
            if (bgColor) {
                document.getElementById('layer-wallpapers-image').style.backgroundColor = bgColor;
            }
            document.getElementById('layer-wallpapers-image').dataset.fastloaded = 'set';
        }

        if (config && config.newtab.wallpapers.defaults.animated_gif) {
            document.body.setAttribute('animated-gif', true);
            document.getElementById('layer-wallpapers-image').style.backgroundSize = 'initial';
            document.getElementById('layer-wallpapers-image').style.backgroundRepeat = 'no-repeat';
        }

        //***********************************
        //* Custom fonts *
        //***********************************
        if (true) {
            document.getElementById('module-search').className = document.getElementById('module-search').className.replace('fontph', 'customfontplaceholder');
            document.getElementById('btn-bg-info').className = document.getElementById('btn-bg-info').className.replace('fontph', 'customfont');
            //document.getElementById('module-clock').className = document.getElementById('module-clock').className.replace('fontph', 'customfont');
            //document.getElementById('weather-live').className = document.getElementById('weather-live').className.replace('fontph', 'customfont');
            document.getElementById('welcome-greeting-message').className = document.getElementById('welcome-greeting-message').className.replace('fontph', 'customfont');
        }

        //***********************************
        //* Searchbar position fast loading *
        //***********************************
        if (config && config.newtab) {
            if (!config.newtab.welcome.defaults.position) {
                var isGreetingActive = config.newtab.welcome.defaults.visible;
                var isWpActive = config.newtab.wallpapers.defaults.visible || true;
                var sbClass = document.getElementById('module-search').className;

                if ((isGreetingActive && sbClass.indexOf('search-position-vtm') !== -1) || isWpActive) {
                    document.getElementById('module-search').className = document.getElementById('module-search').className.replace('search-position-vtm', 'search-position-tl');
                } else if (sbClass.indexOf('search-position-tl') !== -1 && !isGreetingActive) {
                    document.getElementById('module-search').className = document.getElementById('module-search').className.replace('search-position-tl', 'search-position-vtm');
                } else if (sbClass.indexOf('search-position-tc') !== -1 && !isGreetingActive) {
                    document.getElementById('module-search').className = document.getElementById('module-search').className.replace('search-position-tc', 'search-position-vtm');
                }
            }

        }

        var sTerms = '';

        function handleTooFastSearch(event) {

            event = event || window.event;
            var sInput = document.querySelector('#module-search input');

            // Ctrl+C or Cmd+C pressed?
            if ((event.ctrlKey || event.metaKey) && event.keyCode == 67) {
                return;
            }

            // Ctrl+V or Cmd+V pressed?
            if ((event.ctrlKey || event.metaKey) && event.keyCode == 86) {
                return;
            }

            // Ctrl+X or Cmd+X pressed?
            if ((event.ctrlKey || event.metaKey) && event.keyCode == 88) {
                return;
            }

            if (event.key.length === 1) {
                sTerms += event.key;
            }
            if (event.which == 13 || event.keyCode == 13) {
                if (sTerms) {
                    sInput.value = sTerms;
                }
                document.removeEventListener('keydown', handleTooFastSearch);
                sInput.classList.add("auto-search");
                if (event.stopPropagation) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }

        }
        document.addEventListener('keydown', handleTooFastSearch);

        if (!!localStorage.getItem('FRAMEWORK_FOOTER_BTNS_EXPAND'))
            document.body.className += ' footer-menus-expand';

        document.body.className += ' small-view';
    