var home = {
    openFolder: function() {}
};

( home => {
    home.openFolder = function() {
        var folderName = $("#folderName").val();
        if (!folderName)
            return;
        window.location = "JSONEdit.html?folderName=" + folderName;
    }

    $.get(
        "/currentFolder", { }, 
        function( path ) {
            $("#folderName").val(path);
        }
    );

})(home);