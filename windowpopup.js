<script type="text/javascript">
	window.opener.postMessage('authensuccess', '*');
	window.close();
</script>

???????????????????????
window.addEventListener("message", function(ev) {
    if (ev.data === "authensuccess") {
		//TODO: if not have band --> show add band
		//TODO: add value band
		quarkAddManage.displayFormAddQuark();
    }
});
