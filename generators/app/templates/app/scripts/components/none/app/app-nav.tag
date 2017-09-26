<app-nav>
<!-- this is non-themed version -->
    <ul>
        <li>
            <a href='#!/home'>Home <span ng-if={currentLink === 'home'}>&lt;</span></a>
        </li>
        <li>
            <a href='#!/about'>About <span ng-if={currentLink === 'about'}>&lt;</span></a>
        </li>
    </ul>
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
