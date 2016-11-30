(function() {

    var username;
    $(document).ready(function() {
        $('#gen').click(function() {
            username = $('#username').val().trim();
            if ((username !== undefined)&&(username !== "")) {
                generateResume();
            }
            else {
              alert("Please type in a username");
            }
        });
    });

    function userNotFound() {
        $.ajax({
            url: 'notfound.html',
            dataType: 'html',
            success: function(data) {
                $('#intro').html(data);
            }
        });
    };
    function apiOverLimit() {
        $.ajax({
            url: 'apilimit.html',
            dataType: 'html',
            success: function(data) {
                $('#intro').html(data);
            }
        });
    };
    function someError() {
        $.ajax({
            url: 'error.html',
            dataType: 'html',
            success: function(data) {
                $('#intro').html(data);
                $('#errorLink').attr("href", "https://github.com/"+username).attr("title", "GitHub Profile of "+username);
            }
        });
    };

    function generateResume() {
        $.getJSON('https://api.github.com/users/'+username, function(data) {
        //$.getJSON('user.json', function(data) {

            var name = username;
            if (data.name !== null && data.name !== undefined && data.name.length) {
                name = data.name;
            }

            var location = data.location;
            var email = data.email;
            var repos = data.public_repos;
            var reposLabel = data.public_repos > 1 ? 'repositories' : 'repository';

            $.ajax({
                url: 'resume.html',
                dataType: 'html',
                success: function(data) {
                    document.title = name + "'s Resume";
                    $('#resume').html(data);
                    $('header').html('<h2 class="w3-text-white">'+name+'</h2><h5 class="w3-text-white"><a href="https://github.com/'+username+'" class="url" title="GitHub Profile">https://github.com/'+username+' </a></h5>');
                    if (location !== null && location !== undefined && location.length) {
                        $('#userLocation').append('<i class="fa fa-home fa-fw w3-margin-right w3-large w3-text-indigo"></i>'+location);
                    }
                    if (email !== null && email !== undefined && email.length) {
                        $('#userEmail').append('<i class="fa fa-envelope fa-fw w3-margin-right w3-large w3-text-indigo"></i>'+email);
                    }
                    if (repos !== null && repos !== undefined) {
                        $('#userRepos').append('<div class="w3-container w3-center"><p>'+name+' has <a href="https://github.com/'+username+'?tab=repositories">'+repos+' public '+reposLabel+'.</a><i> Below are some samples:</i></p><hr></div>');
                    }
                    else {
                        $('#userRepos').append('<div class="w3-container w3-center"><p>'+name+' has no public repository for now.</p><hr></div>');
                    }
                    $('#genPDF').removeClass('hidden').click(function() {
                        var pdf = new jsPDF();
                        var specialElementHandlers = {
                            '#editor': function (element, renderer) {
                                return true;
                            }
                        };
                        pdf.fromHTML($('#resume').html(), 15, 15, {
                            'width': 170,
                            'elementHandlers': specialElementHandlers
                        });
                        pdf.save('resume.pdf');
                    });
                }
            });

        }).fail(function(error) {
            if (error.status == 404) {
                userNotFound();
            }
            else if (error.status == 403) {
                apiOverLimit();
            }
            else {
                someError();
            }
        });

        $.getJSON('https://api.github.com/users/'+username+'/repos', function(data) {
        //$.getJSON('repos.json', function(data) {

            var languages = {};
            var languageTotal = 0;
            var repos = [];

            $(data).each(function(i, data) {

                if (data.fork !== false) return;
                if (data.language) {
                    if (data.language in languages) {
                        languages[data.language]++;
                    }
                    else {
                        languages[data.language]=1;
                    }
                    languageTotal++;
                }

                if ((data.name) && (data.description) && (data.language)) {
                    repos.push({
                        repoName: data.name,
                        repoDesc: data.description,
                        repoLang: data.language
                    });
                }

            });

            function sortLanguages(langArr) {
                var sortedLang = [];
                for (var lang in langArr) {
                    sortedLang.push({
                        name: lang,
                        popularity: langArr[lang]
                    });
                }
                return sortedLang;
            }

            $.ajax({
                url: 'resume.html',
                dataType: 'html',
                success: function(data) {
                    languages = sortLanguages(languages);
                    if ( $.isEmptyObject(languages) ) {
                        var p = $('<p>This user has not worked with any languages yet.</p>');
                        $('#userLanguages').append(p);
                    }
                    else {
                        var ul = $('<ul></ul>');
                        var percent, li;

                        $.each(languages, function(i, lang) {
                            percent = parseInt( (lang.popularity / languageTotal) * 100 );
                            li = $('<li><p>'+lang.name+'  '+percent+'%<p><div class="w3-progress-container w3-round-xlarge w3-small"><div class="w3-progressbar w3-round-xlarge w3-indigo" style="width:'+percent+'%"></div></div></li>');
                            ul.append(li);
                            $('#userLanguages').append(ul);
                        });
                    }
                    if (repos.length > 0) {
                        var ul = $('<ul></ul>'), li;

                        $.each(repos, function(i, r) {
                            li = $('<div class="w3-container"><h5 class="w3-opacity"><b>'+r.repoName+'</b></h5><i class="w3-small">Creator and Owner</i><p>Description: '+r.repoDesc+'</p><p>Language: '+r.repoLang+'</p><hr></hr></div>');
                            ul.append(li);
                            $('#userRepos').append(ul);

                        });
                    }
                }
            });
        }).fail(function(error) {
             $('body').append('<div class="w3-container"><h5 class="w3-red w3-center">Reload the page and try again</h5>');
        });
    }; // generateResume

})();
