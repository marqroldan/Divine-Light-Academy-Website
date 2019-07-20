const app = {
    name: 'Divine Light Academy',
    init: function(){
        app.nav['main'] =  document.querySelector('#navSection');
        app.page.default = {url:'#home'};
        app.page.default.title = document.querySelector(app.page.default.url).getAttribute('page_title');
        app.nav.menuContainer = document.querySelector('#navForScroll');
        //History manipulator
        app.history.change(app.page.default);
        
        //Adding event listeners for triggering the navigation change
        scrollTrigger = 0;
        function navScroll() {
            if(!document.querySelector('.navSection__toggler').offsetParent || app.nav.scrollActive) {
                if(scrollTrigger) clearTimeout(scrollTrigger);
                scrollTrigger = setTimeout(app.nav.scrollNavToggle, 50);
            }
        }
        window.addEventListener('scroll',navScroll);
        window.addEventListener('resize',navScroll);

        //Event listener for menu toggle
        document.querySelector('.navScroll__toggler').addEventListener('click', app.nav.menuToggle);

        //To check if the user is still clicking on the right place
        document.addEventListener('click', app.nav.menuClickCheck);

        //Attach event listener to nav links
        document.querySelectorAll('.nav__link').forEach((link)=>{
           link.addEventListener('click', app.nav.click);
        })

        //Event listener for logo 
        document.querySelector('.school__logo').addEventListener('logoChange', app.logoChange);

    },
    history: {
        change: function(params) {
            title = params.title ? params.title : '';
            url = params.url ? params.url : '';

            if(url=='') return;
            if(title!='') {
                document.title = `${app.name} - ${title}`;
            }

            switch(params.type) {
                case 'push':
                    history.pushState({}, title, url);
                    break;
                default:
                    history.replaceState({}, title, url);
            }
            app.page.current = url;
        }
    },
    logoChange: function() {
        logo = document.querySelector('.school__logo');
        if(app.page.current != app.page.default.url) {
            logo.classList.add('school__logo--show');
            logo.style.transition = "all 0.3s ease-in-out";
        }
        else {
            function transitionRemove() {
                logo.style.transition = "";
            }
            current.addEventListener('transitionend', transitionRemove);
            logo.classList.remove('school__logo--show');
        }
    },
    nav: {
        _state: {
            menuToggle: false,
        },
        applyStyle: function(callback) {
            if(callback) {
                app.nav.menuContainer.addEventListener('transitionend',callback);
            }
            Object.keys(app.nav.menuStyle).forEach(function(key) {
                app.nav.menuContainer.style[key] = app.nav.menuStyle[key];
            });
        },
        click: function(e) {
            e.preventDefault();
            if(this.getAttribute('href')=='#') return;
            switch (this.getAttribute('link_type')) {
                case 'page':
                    if(location.hash==this.getAttribute('href')) {
                        app.page.scroll(this);
                    }
                    else {
                        app.page.change(this);
                    }
                    break;
                case 'tab':    
                    app.tab.change(this);
                    break;
                default:
                    app.page.scroll(this);
                    break;
            }
        },
        menuClickCheck: function(e) {
            if(document.querySelector('#navForScroll').style.left!='') {
                foundCorrect = false;
                e.path.forEach(function(item) {
                    foundCorrect = foundCorrect | (item.id == 'navForScroll' || item.id == 'navigationToggler');
                });
    
                if(!foundCorrect) {
                    app.nav.menuReset();
                }
            }
        },
        menuReset: function() {
            menuContainer = app.nav.menuContainer;
            function removeOpacity() {
                console.log('calledme');
                app.nav.menuStyle['opacity'] = "";
                app.nav.applyStyle();
                menuContainer.removeEventListener('transitionend', removeOpacity);
            }

            menuContainer.addEventListener('transitionend', removeOpacity);
            app.nav.menuStyle['left'] = '';
            app.nav.applyStyle();
        },
        menuStyle: {},
        menuToggle: function() {
            if(!app.nav._state.menuToggle) {
                app.nav._state.menuToggle = true;
                menuContainer = app.nav.menuContainer;
                if(!menuContainer.classList.contains('navScroll__container')) {
                    menuContainer.classList.add('navScroll__container');
                }
                else {
                    document.querySelector('#navForScroll').style = "";
                }

                if (app.nav.menuStyle['left'] && app.nav.menuStyle['left']!='') {
                    app.nav.menuStyle['left'] = '';
                    removeOpacity = function() {
                        app.nav.menuStyle['opacity'] = '';
                        console.log('called');
                        app.nav.applyStyle();
                        app.nav._state.menuToggle = false;
                        menuContainer.removeEventListener('transitionend',removeOpacity);
                    };
                    app.nav.applyStyle(removeOpacity);
                }
                else {
                    app.nav.menuStyle['left'] = "0px";
                    app.nav.menuStyle['opacity'] = "1";
                    app.nav.applyStyle(function() {
                        app.nav._state.menuToggle = false;
                    });
                    
                }
            }
        },
        scrollActive: false,
        scrollNavToggle: function () {
            let top  = window.pageYOffset || document.documentElement.scrollTop;
            let navi = app.nav.main;

            if(top>=400) {
                //Change the nav into a scrolling nav
                if(navi.classList.contains('sectionForHeader')) {
                    app.nav.scrollActive = true;
                    navi.classList.remove('sectionForHeader');
                    navi.classList.add('sectionForScroll');
                    navi.style.opacity = "1";

                    navi.querySelector('.nav').classList.add('navScroll');
                    navi.querySelector('.nav').classList.add('navScroll');

                    navi.querySelector('#navForScroll').classList.add('navScroll__container');
                    navi.querySelector('#navForScroll').classList.remove('nav--forHeader');

                    document.querySelectorAll('#navSection .nav__link').forEach(function(link) {
                        link.classList.add('nav__link--forScroll');
                    });

                }
            }
            else {
                //Change back into header nav
                if(navi.classList.contains('sectionForScroll')) {
                    app.nav.scrollActive = false;
                    navi.classList.remove('sectionForScroll');
                    navi.classList.add('sectionForHeader');
                    navi.style.opacity = "1";

                    navi.querySelector('.nav').classList.remove('navScroll');

                    navi.querySelector('#navForScroll').classList.remove('navScroll__container');
                    navi.querySelector('#navForScroll').classList.add('nav--forHeader');

                    document.querySelectorAll('#navSection .nav__link').forEach(function(link) {
                        link.classList.remove('nav__link--forScroll');
                    });

                    app.nav.menuReset();
                }
            }
        }
    },
    page: {
        current: '',
        change: function(elem) {
            //check if element exists
            let target = document.querySelector(elem.getAttribute('href'));
            if(target) {
                pageName = target.getAttribute('page_title') ? target.getAttribute('page_title') : '';
                current = document.querySelector(app.page.current);
                
                app.history.change({type: 'push', title: pageName, url: elem.getAttribute('href')})
                function triggerShow() {
                    console.log('called')
                    current.style.display = "none";
                    target.style.display = "block";
                    target.classList.add('main--active');
                    current.removeEventListener('transitionend', triggerShow);
                    app.page.scroll(elem);
                }
                current.addEventListener('transitionend', triggerShow);
                current.classList.remove('main--active');

                document.querySelector('.school__logo').dispatchEvent(new Event('logoChange'));
            }
        },
        scroll: function(elem) {
            console.log('scrolly');
            //No need for code as smooth scrolling is enabled in CSS
            //Problem with CSS-enabled smooth scrolling will be cross browser compatibility
            href = elem.getAttribute('href');
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        },
    },
    tab: {
        change: function(elem) {
            href = elem.getAttribute('href');
            tabGroup = elem.parentNode.parentNode.getAttribute('id');

            activeContainerClass = `${tabGroup}Container--active`;
            del=document.querySelector(`#${tabGroup} .${activeContainerClass}`);
            el=document.querySelector(href);
            if(el && el!=del) {
                activeTabClass = 'nav__link--forTabs--active';
                document.querySelector(`#${tabGroup} .${activeTabClass}`).classList.remove(activeTabClass);
                elem.classList.add(activeTabClass);
                function triggerShow() {
                    del.classList.remove(activeContainerClass);
                    el.classList.add(activeContainerClass);
                    del.classList.remove('animation__fadeOut');
                    del.removeEventListener('transitionend', triggerShow);
                }
                del.addEventListener('transitionend', triggerShow);
                del.classList.add('animation__fadeOut');
            }
            
        }
    }
}

document.addEventListener('DOMContentLoaded', app.init);