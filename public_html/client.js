function getExtent(str) {
    var e = $("#ruler");
    e.empty();
    e.text(str);
    var width = e.get(0).offsetWidth; 
    return width;
}
function NoteCell(html, id, name, textLength){
    this.data = {
        html      : html,
        textLength: textLength
    };
    this.id = id;
    this.name = name;
    this.children = new Array();
    this.addChild = function(html, id, name, textLength){
        this.children.push(new NoteCell(html, id, name, textLength));
    }
}
function Note(){
    this.list= new Array();
    this.tree = new NoteCell();
    
    this.addList = function(img_link_url, img_url, dst_url, dst_uname, src_url, src_uname){
        this.list.push({
            img_link_url : img_link_url,
            img_url      : img_url,
            dst_url      : dst_url,
            dst_uname    : dst_uname,
            src_url      : src_url,
            src_uname    : src_uname
        });
    }
    //this.getChildDepth = function(n, obj){
    //    for(var i in obh){
    //        if(obj[o] === "children"){
    //            for(var j in obj[i]){
    //                var res = this.getChildDepth(++n,obj[i]);
    //                if(res ===
    //}
    this.getTreeByName = function(name, obj){
        for(var i in obj){
            if(i === "name"){
                if(obj[i] === name) return obj;
            }
            if(i === "children"){
                for(var j in obj[i]){
                    var res = this.getTreeByName(name, obj[i][j]);
                    if(res === "notFound") continue;
                    return res;
                }
                return "notFound";
            }
        }
        return "notFound";
    }
    this.listToTree = function(){
        for(var i = this.list.length - 1; i >= 0; i--){
            var noteCell = this.list[i];
            var html = '<a href="'+ noteCell.dst_url +'"target="_blank"><img src="'+ noteCell.img_url + '">'+ noteCell.dst_uname +'</a>';
            //var textLength = noteCell.dst_uname.length;
            var textLength = getExtent(noteCell.dst_uname) + 60;
            var id = this.list.length - 1 - i;
            var name = noteCell.dst_uname;
            
            // when first loop. create initial note
            if(id === 0){       
                this.tree = new NoteCell(html, id, name, textLength);
                continue;
            }
            var src_note = this.getTreeByName(noteCell.src_uname, this.tree);
            if(src_note === "notFound") continue;
            src_note.addChild(html, id, name, textLength);
        }
    }
}


$jit.ST.Plot.NodeTypes.implement({
    'colorlessnode': {
        'render': function(node, canvas, animating) {
      }
    }
});

var note;
var st;
$(function(){
    console.log("start");
    function createST(){
        st = new $jit.ST({
           injectInto: 'graph',
           //width: document.body.clientWidth,
           width: 1300,
           height:900,
           constrained: false,
           levelsToShow: 50,
           levelDistance: 150,
           Node: {
               height: 60,
               //width: 190,
               //autoHeight: true,
               autoWidth:  true,
               //type: 'rectangle',
               type: 'colorlessnode',
               color:'#2C4762',
               lineWidth: 2,
               align:"center",
               overridable: true
           },

           Navigation: {
               enable:true,
               panning:true
           },
           Edge: {
               type: 'bezier',
               lineWidth: 2,
               color:'#23A4FF',
               overridable: true
           },

           onBeforeCompute: function(node){
               //console.log("loading " + node.name);
               //console.log(node);
           },

           onAfterCompute: function(){
               //console.log("done");
           },
           onCreateLabel: function(label, node){
               label.id = node.id; 
               label.innerHTML = node.data.html;
               label.className += " well";
               //set label styles
               var style = label.style;
               //style.height = 30 + 'px';            
               style.cursor = 'default';
               style.color = '#000';
               style.whiteSpace = 'nowrap';
               style.fontSize = '1.2em';
               //style.textAlign= 'center';
               style.webkitUserSelect = 'none';
               //style.paddingTop = '3px';
           }
        });
        if(!note) return;
        st.loadJSON(note.tree);
        st.compute();
        st.onClick(st.root);
        st.switchPosition('top','replot');
    }
    $("#button").click(function(){
        $("#button").button('loading');
        note = new Note();
        var url = $("#textUrl").val();
        $.get("/getnotes",{"q":url},function(res){
            $("#notedata").empty();
            $("#notedata").append(res);
            $("#notedata li[class*=reblog]").each(function(){
                if(this.children[1].childElementCount == 1){    // foo posted this
                    note.addList(
                        this.children[0].href,                  //img_link_url
                        this.children[0].children[0].src,       //img_url
                        this.children[1].children[0].href,      //dst_url
                        this.children[1].children[0].innerText, //dst_usrname
                        null,                                   //src_url
                        null                                    //src_usrname
                    );
                } else {
                    note.addList(
                        this.children[0].href,                  //img_link_url
                        this.children[0].children[0].src,       //img_url
                        this.children[1].children[0].href,      //dst_url
                        this.children[1].children[0].innerText, //dst_usrname
                        this.children[1].children[1].href,      //src_url
                        this.children[1].children[1].innerText  //src_usrname
                    );
                }
            })
        note.listToTree();
        $("#graph").empty(); 
        createST();
        $("#button").button('reset');
        var targetOffset = $('#graph').offset().top;
        $('html,body').animate({scrollTop: targetOffset}, 1000);

        })
    });
    
    $(window).resize(function(){
        //createST();
    });

});
