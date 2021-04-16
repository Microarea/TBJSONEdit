var home = {
    openFolder: function() {}
};

(home => {

    home.openFile = function() {
        var folderName = $("#folderName").val();
        if (!folderName)
            return;
        var fileName = $("#filelist").val();
        if (!fileName)
            return;
        window.location = "JSONEdit.html?folderName=" + folderName + "&filename=" + fileName;
    };

    home.openFolder = function() {
        var folderName = $('#folderName').val();
        if (!folderName)
            return;
        window.location = "JSONEdit.html?folderName=" + folderName;
    }

    function getFileList() {
        var folderName = $("#folderName").val();
        $('#filelist').empty();
        $.get(
            "/openFolder", { folderName: folderName },
            function(data) {
                data.forEach(form => {
                    var tile = JSON.parse(form.content);
                    $('#filelist').append($('<option/>', {
                        value: form.fname,
                        text: form.fname
                    }));
                });
            }
        );
    }

    home.fileList = function() {
        getFileList();
    }

    $('#folderName').blur(function() {
        getFileList();
    });

    $.get(
        "/currentFolder", {},
        function(path) {
            $("#folderName").val(path);
            getFileList();
        }
    );

})(home);