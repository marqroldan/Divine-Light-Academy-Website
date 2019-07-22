const app = {
    ajax: {
        requestForJSON: function(settings={}, callback={}) {
            if(settings.url) {
                settings.type = settings.type ? settings.type : "GET"
                let xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function(res) {
                    if (xhttp.readyState === XMLHttpRequest.DONE) {
                        if (xhttp.status === 200) {
                            if (callback.success) callback.success(xhttp.responseText);
                        } else {
                            if (callback.fail) callback.fail(xhttp.responseText);
                        }
                    }
                }
                xhttp.open(settings.type, settings.url, true);
                xhttp.send();
            }
        }
    },
    data: {},
    name: 'Divine Light Academy',
    init: function(){
        app.nav['main'] =  document.querySelector('#navSection');
        app.page.default = {url:'#home'};
        app.page.default.title = document.querySelector(app.page.default.url).getAttribute('page_title');
        app.nav.menuContainer = document.querySelector('#navForScroll');

        document.querySelector(app.page.default.url).style.display = "block";

        //History manipulator
        app.history.change(app.page.default);
        window.addEventListener('popstate', app.page.pop);
        
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

        //Slider event listener
        app.slider.groups = document.querySelectorAll('[slider]');
        app.slider.groups.forEach(function(group) {
            sliderName = group.getAttribute('class');
            sliderNavigation = document.querySelector(`.${sliderName}Navigation`);

            let count = 1;
            group.querySelectorAll(`.${sliderName}Item`).forEach(function(item) {
                sliderId = `${sliderName}_${count}`;
                item.setAttribute('sliderId',sliderId);
                itemClass = `${sliderName}NavigationItem`;
                itemActive = '';
                if(item.classList.contains(`${sliderName}Item--active`)) itemActive = `${itemClass}--active`;
                //create a navigation element
                navigationItem = document.createElement('span');
                navigationItem.setAttribute('class',`${itemClass} ${itemActive}`);
                navigationItem.setAttribute('sliderId',sliderId);
                navigationItem.appendChild(document.createElement('span'));
                navigationItem.addEventListener('click',app.slider.navigationClick);
                item.addEventListener('click',app.slider.navigationClick);
                sliderNavigation.appendChild(navigationItem);

                count++;
            });
        });

        //For Spreadsheet fetching
        app.ajax.requestForJSON({
            url: "https://sheets.googleapis.com/v4/spreadsheets/1aSK7EtWE5BG0nTK6BtqyXKsC29ZgEFEdyVljh4kXdkA/values:batchGet?ranges=Academics!A:B&ranges=Sports!A:B&ranges=Co-curricular!A:B&ranges=News!A:D&ranges=PageDetails!A:B&key=AIzaSyB5rPWvvLISKtPT7KH4kFecFAjL3ZGUYVs"}, {
            success: app.handler.spreadsheet.success,
            fail: app.handler.spreadsheet.fail,
        });
    },
    handler: {
        spreadsheet: {
            success: function(res) {
                let data = JSON.parse(res);
                app.data.achievements = {};
                app.data.achievements.academics = data.valueRanges[0].values;
                app.data.achievements.sports = data.valueRanges[1].values;
                app.data.achievements.coCurricular = data.valueRanges[2].values;
                app.data.news = data.valueRanges[3].values;
                app.data.pageDetails = data.valueRanges[4].values;
                
                //For achievements page
                Object.keys(app.data.achievements).forEach(function(key) {
                    let data = app.data.achievements[key];
                    //Get the keys
                    let keys = data[0];
                    data[0] = null;
                    data = data.reverse().filter(Boolean);
                    let string = '';
                    for(i=0;i<data.length;i++) {
                        for(j=0;j<keys.length;j++) {
                            if(data[i][j]) {
                                string += `
                                <div class="${keys[j]}">
                                ${data[i][j]}
                                </div>
                                `;
                            }
                        }
                    }
                    if(dObject = document.querySelector(`#${key}`))
                    {
                        dObject.innerHTML = string;
                    }
                });
            },
            fail: function(res) {
                console.log("Failed to fetch spreadsheet:", res);
            }
        }
    },
    history: {
        change: function(params) {
            title = params.title ? params.title : '';
            url = params.url ? params.url : '';
            state = params.state ? params.state : {};

            if(url=='') return;
            if(title!='') {
                document.title = `${app.name} - ${title}`;
            }

            switch(params.type) {
                case 'push':
                    history.pushState(state, title, url);
                    break;
                default:
                    history.replaceState(state, title, url);
            }
            if(!params.samePage) {
                app.page.current = url;
            }
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
                current.removeEventListener('transitionend',transitionRemove);
            }
            current.addEventListener('transitionend', transitionRemove);
            logo.classList.remove('school__logo--show');
        }
    },
    nav: {
        _state: {
            menuToggle: false,
            clicking: 0,
        },
        _functions: {
            removeOpacity: function() {
                app.nav.menuStyle['opacity'] = '';
                app.nav.applyStyle();
                app.nav._state.menuToggle = false;
                app.nav.menuContainer.removeEventListener('transitionend',app.nav._functions.removeOpacity);
            },
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
            if((new Date()).getTime() - app.nav._state.clicking >= 500) {
                app.nav._state.clicking  = (new Date()).getTime();
                if(this.getAttribute('href')=='#') return;
                switch (this.getAttribute('link_type')) {
                    case 'page':
                        if(app.page.current==this.getAttribute('href')) {
                            app.page.scroll(this,{samePage: true});
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
            }
        },
        menuClickCheck: function(e) {
            if(document.querySelector('#navForScroll').style.left!='') {
                foundCorrect = false;
                e.path.forEach(function(item) {
                    foundCorrect = foundCorrect | (item.id == 'navForScroll' || item.id == 'navigationToggler');
                });
    
                if(!foundCorrect) {
                    app.nav._state.menuToggle = false;
                    app.nav.menuReset();
                }
            }
        },
        menuReset: function(opacityDown=false) {
            menuContainer = app.nav.menuContainer;
            if(opacityDown) { app.nav.menuStyle['opacity'] = ''; }
            app.nav.menuStyle['left'] = '';
            app.nav.applyStyle(app.nav._functions.removeOpacity);
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
                    app.nav.applyStyle(app.nav._functions.removeOpacity);
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

                    app.nav.menuReset(true);
                }
            }
        }
    },
    page: {
        current: '',
        change: function(elem, settings={}) {
            //check if element exists
            let target = document.querySelector(elem.getAttribute('href'));
            if(target) {
                pageName = target.getAttribute('page_title') ? target.getAttribute('page_title') : '';
                current = document.querySelector(app.page.current);
                if(!settings.historyObj) settings['historyObj'] = {};
                settings.historyObj.type = 'push';
                settings.historyObj.title = pageName;
                settings.historyObj.url =  elem.getAttribute('href');
                if(!settings.pop) {
                    app.history.change(settings.historyObj);
                }
                else {
                    app.page.current = elem.getAttribute('href');
                }

                function triggerShow() {
                    current.removeEventListener('transitionend', triggerShow);
                    current.style.display = "none";
                    target.style.display = "block";
                    setTimeout(function() {
                        target.classList.add('main--active');
                    }, 50)
                    if(elem.getAttribute('delay_href')) {
                        elem.setAttribute('href',elem.getAttribute('delay_href'));
                        elem.removeAttribute('delay_href');
                    }
                    app.page.scroll(elem, settings);
                    if(settings.callback) settings.callback();
                }
                current.addEventListener('transitionend', triggerShow);
                setTimeout(function() {
                    current.classList.remove('main--active');
                }, 50);

                document.querySelector('.school__logo').dispatchEvent(new Event('logoChange'));
            }
        },
        pop: function(e) {
            document.querySelector("#top").scrollIntoView({ behavior: 'smooth' });
            anchor = document.querySelector(`a[href="${location.hash}"]`)
            if(anchor.getAttribute('link_type')=='page') {
                app.page.change(anchor,{pop:true});
            }
            else {
                app.page.scroll(anchor, {pop:true});
            }
        },
        scroll: function(elem, settings={}) {
            href = elem.getAttribute('href');
            targetPageId = document.querySelector(href).parentNode.parentNode.getAttribute('id');
            if(targetPageId && targetPageId != app.page.current.replace('#','')) {
                elem.setAttribute('href',`#${targetPageId}`);
                elem.setAttribute('delay_href', href);
                app.page.change(elem, settings);
            }
            else {
                //Smooth scrolling can also be enabled using CSS but might have issues with cross browser compatibility
                if((app.page.current != href || settings.samePage) && !settings.pop)  {
                    app.history.change({type: 'push', samePage: true, title: elem.textContent, url: href})
                }
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        },
    },
    slider: {
        _state: {
            click: (new Date()).getTime(),
        },
        groups: [],
        itemClick: function() {

        },
        navigationClick: function() {
            if((new Date()).getTime() - app.slider._state.click >= 500) {
                app.slider._state.click = (new Date()).getTime();
                try {
                    parentContainer = this.parentNode.id.replace('Navigation','');
                }
                catch (e) {}
                finally {
                    if (parentContainer=='') {
                        parentContainer = this.parentNode.parentNode.getAttribute('class');
                    }
                }
                    targetItem = document.querySelector(`.${parentContainer}Item[sliderId=${this.getAttribute('sliderId')}]`);
                    activeItem = document.querySelector(`.${parentContainer}Item--active`);
                    mover = document.querySelector(`.${parentContainer} .sliderMover`);
                    parentNode = document.querySelector(`.${parentContainer}`);
    
                    activeNavItemClass = `${parentContainer}NavigationItem--active`;
                    activeNavItem = document.querySelector(`.${activeNavItemClass}`);
                    activeNavItem.classList.remove(activeNavItemClass)
                    document.querySelector(`.${parentContainer}NavigationItem[sliderId=${this.getAttribute('sliderId')}]`).classList.add(activeNavItemClass);
    
                    activeItem.classList.remove(`${parentContainer}Item--active`);
                    targetItem.classList.add(`${parentContainer}Item--active`);
                    marginLeft = parentNode.offsetLeft - targetItem.offsetLeft;
                    if(mover.style.marginLeft!='') {
                        marginLeft = Number(mover.style.marginLeft.replace('px',''));
                        if(parentNode.offsetLeft != targetItem.offsetLeft) {
                            marginLeft += parentNode.offsetLeft - targetItem.offsetLeft;
                        }
                    }
                    mover.style.marginLeft = `${marginLeft}px`;
            }
        }
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