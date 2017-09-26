
<app-route>
    <div class="container">
        <virtual data-is={component}></virtual>
    </div><!-- /.container -->

    <script>
        // main module import
        import route from 'riot-route';
        // tag import
        import 'components/home/home.tag';
        import 'components/about/about.tag';
        // setup default component
        this.component = 'home';
        // change the route base so the archor can work
        route.base('#!');
        // start listen to route
        route((collection) => {
            switch (collection) {
                case 'about':
                    this.component = 'about';
                break;
                default:
                    this.component = 'home';
            }
            // notify the other via the global state
            if (this.opts.state) {
                this.opts.state.trigger('routed' , collection);
            }
            this.update();
        });
        // start router
        route.start(true);

    </script>
</app-route>
