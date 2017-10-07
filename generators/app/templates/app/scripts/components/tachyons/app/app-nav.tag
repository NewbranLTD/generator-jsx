<app-nav>

    <nav class="pa3 pa4-ns">
        <a class="link dim black b f1 f-headline-ns tc db mb3 mb4-ns" href="#!/" title="Home">
            <%= appName %>
        </a>
        <div class="tc pb3">
            <a class="link dim gray f6 f5-ns dib mr3" href="#!/home" title="Home">Home</a>
            <a class="link dim gray f6 f5-ns dib mr3" href="#!/about" title="About">About</a>
        </div>
    </nav>

    <script>
        this.currentLink = 'home';
        this.on('mount' , () =>
        {
            this.opts.state.on('routed' , current =>
            {
                this.currentLink = current;
                this.update();
            });
        });
    </script>
</app-nav>
