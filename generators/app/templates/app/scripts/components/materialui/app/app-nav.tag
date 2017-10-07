<app-nav>
    <nav class="navbar navbar-toggleable-md navbar-light bg-faded">
        <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <a class="navbar-brand" href="#">
            <%= appName %>
        </a>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class={"nav-item": true, "active": currentLink === 'home'}>
                    <a class="nav-link" href="#!/home">Home <span class="sr-only" ng-if={currentLink === 'home'}>(current)</span></a>
                </li>
                <li class={"nav-item": true, "active": currentLink === 'about'}>
                    <a class="nav-link" href="#!/about">About <span class="sr-only" ng-if={currentLink === 'about'}>(current)</span></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link disabled" href="#">Disabled</a>
                </li>
            </ul>
            <form class="form-inline my-2 my-lg-0">
                <input class="form-control mr-sm-2" type="text" placeholder="Search" />
                <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
            </form>
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
