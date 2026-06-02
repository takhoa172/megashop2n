(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var fileInput = document.getElementById("id_image_file");
    if (!fileInput) return;

    var container = document.getElementById("cropper-container-image_file");
    var previewImg = document.getElementById("cropper-img-image_file");
    var ratioSelect = document.getElementById("id_aspect_ratio");
    var cropX = document.getElementById("id_crop_x");
    var cropY = document.getElementById("id_crop_y");
    var cropW = document.getElementById("id_crop_width");
    var cropH = document.getElementById("id_crop_height");
    var clearCheckbox = document.getElementById("id_clear_image");

    var cropper = null;

    var ratios = {
      free: NaN,
      "16:9": 16 / 9,
      "4:3": 4 / 3,
      "1:1": 1,
    };

    function updateCropData() {
      if (!cropper) return;
      var data = cropper.getData(true);
      cropX.value = Math.round(data.x);
      cropY.value = Math.round(data.y);
      cropW.value = Math.round(data.width);
      cropH.value = Math.round(data.height);
    }

    function destroyCropper() {
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      container.style.display = "none";
    }

    fileInput.addEventListener("change", function () {
      var file = this.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (ev) {
        previewImg.src = ev.target.result;
        container.style.display = "block";

        destroyCropper();
        cropper = new Cropper(previewImg, {
          aspectRatio: ratios[ratioSelect ? ratioSelect.value : "free"] || NaN,
          viewMode: 1,
          autoCropArea: 0.8,
          background: false,
          crop: updateCropData,
        });
      };
      reader.readAsDataURL(file);
    });

    if (ratioSelect) {
      ratioSelect.addEventListener("change", function () {
        if (cropper) {
          cropper.setAspectRatio(ratios[this.value] || NaN);
        }
      });
    }

    if (clearCheckbox) {
      clearCheckbox.addEventListener("change", function () {
        if (this.checked) {
          fileInput.disabled = true;
          if (ratioSelect) ratioSelect.disabled = true;
          destroyCropper();
        } else {
          fileInput.disabled = false;
          if (ratioSelect) ratioSelect.disabled = false;
        }
      });
    }
  });
})();
