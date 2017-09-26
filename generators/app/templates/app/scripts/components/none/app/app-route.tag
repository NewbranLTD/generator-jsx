
<app-route>
    <virtual data-is={component}></virtual>
    <script>
        import route from 'riot-route';

        import 'components/home/home.tag';
        import 'components/about/about.tag';

        this.component = 'home';

        route.base('#!');

        route((collection) => {

            switch (collection) {
                case 'about':
                    this.component = 'about';
                break;
                default:
                    this.component = 'home';
            }
            this.opts.state.trigger('routed' , collection);
            this.update();
        });

        route.start(true);

    </script>
</app-route>
