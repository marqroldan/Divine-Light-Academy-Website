const app = {
    init: function(){
        app.nav['main'] =  document.querySelector('#navSection');

        scrollTrigger = 0;
        function navScroll() {
            if(!document.querySelector('.navSection__toggler').offsetParent || app.nav.scrollActive) {
                if(scrollTrigger) clearTimeout(scrollTrigger);
                scrollTrigger = setTimeout(app.nav.scrollNavToggle, 250);
            }
        }
        window.addEventListener('scroll',navScroll);
        window.addEventListener('resize',navScroll);

        //Attach event listener to nav links
        document.querySelectorAll('.nav__link').forEach((link)=>{
           link.addEventListener('click', app.nav.click);
        })

    },
    nav: {
        click: function(e) {
            e.preventDefault();

            switch (this.getAttribute('link_type')) {
                case 'page':
                    app.page.change(this);
                    break;
                case 'tab':    
                    app.tab.change(this);
                    break;
                default:
                    app.page.scroll(this);
                    break;
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

                    navi.querySelector('.nav').classList.remove('navScroll');

                    navi.querySelector('#navForScroll').classList.remove('navScroll__container');
                    navi.querySelector('#navForScroll').classList.add('nav--forHeader');

                    document.querySelectorAll('#navSection .nav__link').forEach(function(link) {
                        link.classList.remove('nav__link--forScroll');
                    });
                }
            }
        }
    },
    page: {
        scroll: function(elem) {
            //No need for code as smooth scrolling is enabled in CSS
            //Problem with CSS-enabled smooth scrolling will be cross browser compatibility
            href = elem.getAttribute('href');
            document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
        },
        change: function(elem) {
            
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