
<app>
    <app-nav state={globalState}></app-nav>
    <app-route state={globalState}></app-route>

    <script>
        import 'components/app/app-nav.tag';
        import 'components/app/app-route.tag';
        /**
         * create a global state to share between the nav and content
         */
         // this will be the hook between the app and the site-nav
         this.on('mount' , ()=>
         {
             this.update({
                 globalState: riot.observable({})
             });
         });
    </script>
</app>
