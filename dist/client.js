// import * as THREE from '/build/three.module.js';
// import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
// import {OrbitControls} from './jsm/controls/OrbitControls.js';
// import {GUI} from './jsm/libs/lil-gui.module.min.js';
// import Stats from './jsm/libs/stats.module.js';
// import { MeshoptDecoder } from './jsm/libs/meshopt_decoder.module.js'; 
// import {OBJLoader} from './jsm/loaders/OBJLoader.js';
// import {MTLLoader} from './jsm/loaders/MTLLoader.js';
// import {FBXLoader} from './jsm/loaders/FBXLoader.js';

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'; 
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';


let scene;
let camera;
let renderer;
let input_model;
let spotLightHelper1; 
let spotLightHelper2; 
let model_container = document.querySelector('.web-gl');
let defaultScale; 
let scaleXControl, scaleYControl, scaleZControl;
let defaultCameraPosition;
let camerapositionControl;

let scaleControl; 


const loadingManager = new THREE.LoadingManager();
// loadingManager.onProgress = function(url, item, total){
//     console.log(`Started loading ${url}`);
// }

// loadingManager.onProgress = function(url, loaded, total){
//     console.log(`Started loading ${url}`);
// }

const progressBar = document.getElementById("progress-bar");

loadingManager.onProgress = function(url, loaded, total){
    progressBar.value = (loaded / total) * 100;
}

const progressBarContainer = document.querySelector(".progress-bar-container");
loadingManager.onLoad = function(){
    progressBarContainer.style.display = "none";
}

// loadingManager.onLoad = function() {
//     console.log("Just finished loading");
// }

// loadingManager.onError = function(url) {
//     console.error(`Got a problem loading ${url}`);
// }

const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.display = 'none'; // Hide stats by default

let controls;

const init = () => {
    scene = new THREE.Scene();

    // scene.background = new THREE.Color(0x000000); // Set black background
    

    const fov = 40;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const gui = new GUI();
    gui.domElement.style.display = 'none'; // Hide the GUI by default
    gui.close(); // Close the GUI by default


    camera.position.set(0, 0, 25); //camera.position.set(0, 0, 25);
    scene.add(camera);

    
    // camera_position.add(lightHelperControl1, "showHelpers").name("Show Front Light Helpers").onChange((value) => {
    //     if (value) {
    //         scene.add(spotLightHelper1); // Add front light helper to the scene
    //     } else {
    //         scene.remove(spotLightHelper1); // Remove front light helper from the scene
    //     }
    // });
    // camera_position.add(camera.position, 'x', -1000, 1000, 0.5);
    // camera_position.add(camera.position, 'y', -1000, 1000, 0.5);
    // camera_position.add(camera.position, 'z', -1000, 1000, 0.5);
    const statsControl = { showStats: false };
    gui.add(statsControl, "showStats").name("Show Stats").onChange((value) => {
        stats.domElement.style.display = value ? 'block' : 'none'; // Show or hide stats
    });

    // Add a checkbox to control the alpha property of the renderer
    const alphaControl = { alpha: false }; // Default to false
    gui.add(alphaControl, "alpha").name("Alpha (Transparent Background)").onChange((value) => {
        // Update the renderer's alpha property
        renderer.dispose(); // Dispose the current renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: value, canvas: model_container }); // Reinitialize the renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement); // Append the new renderer to the DOM
    });
    
    const camera_position = gui.addFolder("Camera").close();
    // Get the default camera position of the model
    defaultCameraPosition = camera.position.clone();

    camerapositionControl = {
        x: defaultCameraPosition.x,
        y: defaultCameraPosition.y,
        z: defaultCameraPosition.z
    };


    const camerapositionXControl = camera_position.add(camerapositionControl, 'x', -1000, 1000, 0.5).name(`x`);
    const camerapositionYControl = camera_position.add(camerapositionControl, 'y', -1000, 1000, 0.5).name(`y`);
    const camerapositionZControl = camera_position.add(camerapositionControl, 'z', -1000, 1000, 0.5).name(`z`);


    camerapositionXControl.onChange((value) => {
    camera.position.set(value, camera.position.y, camera.position.z);
    camerapositionXControl.updateDisplay(); // Update the GUI display
    });

    camerapositionYControl.onChange((value) => {
    camera.position.set(camera.position.x, value, camera.position.z);
    camerapositionXControl.updateDisplay(); // Update the GUI display
    });

    camerapositionZControl.onChange((value) => {
    camera.position.set(camera.position.x, camera.position.y, value);
    camerapositionZControl.updateDisplay(); // Update the GUI display
    });

    camera_position.add({ resetPosition: () => {
    camera.position.copy(defaultCameraPosition); // Reset the model scale to default
    camerapositionXControl.setValue(defaultCameraPosition.x); // Update GUI control
    camerapositionXControl.updateDisplay(); // Update the GUI display
    camerapositionYControl.setValue(defaultCameraPosition.y); // Update GUI control
    camerapositionYControl.updateDisplay(); // Update the GUI display
    camerapositionZControl.setValue(defaultCameraPosition.z); // Update GUI control
    camerapositionZControl.updateDisplay(); // Update the GUI display
    console.log("Scale reset to default:", defaultCameraPosition );
    }}, 'resetPosition').name('Reset Position');

    renderer = new THREE.WebGLRenderer({
        antialias: true, 
        alpha: false,
        canvas: model_container
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    controls = new OrbitControls(camera, renderer.domElement);
    
    controls.autoRotate = false; // Initially set to false
    controls.autoRotateSpeed = 5.0; // Set the speed of auto-rotation

    const ambientLight = new THREE.AmbientLight(0x404040, 10); 
    scene.add(ambientLight);

    // Create a folder for ambient light controls
    const ambientLightFolder = gui.addFolder("Ambient Light").close();

    const DEFAULT_INTENSITY = 10;
    const DEFAULT_COLOR = '#404040';
    
    // Create control object
    const ambientLightControls = {
        intensity: DEFAULT_INTENSITY,
        color: DEFAULT_COLOR,
        reset: function() {
            ambientLight.intensity = DEFAULT_INTENSITY;
            intensityController.setValue(DEFAULT_INTENSITY);
            intensityController.updateDisplay();
        },
        resetColor: function() {
            ambientLight.color.set(DEFAULT_COLOR);
            colorController.setValue(DEFAULT_COLOR);
            colorController.updateDisplay();
        }
    };

    // Store controller references
    const intensityController = ambientLightFolder.add(ambientLightControls, 'intensity', 0, 30, 0.1)
        .name('Intensity')
        .onChange((value) => {
            ambientLight.intensity = value;
        });

    const colorController = ambientLightFolder.addColor(ambientLightControls, 'color')
        .name('Color')
        .onChange((value) => {
            ambientLight.color.set(value);
        });

    // Add reset button
    ambientLightFolder.add(ambientLightControls, 'reset').name('Reset Intensity');
    ambientLightFolder.add(ambientLightControls, 'resetColor').name('Reset Color');


    const spotLight1 = new THREE.SpotLight(0xffffff, 500); // if 100 use 242 under
    spotLight1.position.set(10, 10, 10); // 6,11,6  2, 4, 2
    scene.add(spotLight1);
    spotLightHelper1 = new THREE.SpotLightHelper(spotLight1, 1, 0xffffff);
    // scene.add(spotLightHelper1);

    const backLight = new THREE.SpotLight(0xffffff, 500);
    backLight.position.set(-10, -10, -10);
    scene.add(backLight);
    spotLightHelper2 = new THREE.SpotLightHelper(backLight, 1, 0xffffff);
    // scene.add(spotLightHelper2);

    const lightHelperControl1 = { showHelpers: false };
    const Front_Light = gui.addFolder("Front Light").close();
    Front_Light.add(lightHelperControl1, "showHelpers").name("Show Front Light Helpers").onChange((value) => {
        if (value) {
            scene.add(spotLightHelper1); // Add front light helper to the scene
        } else {
            scene.remove(spotLightHelper1); // Remove front light helper from the scene
        }
    });
    Front_Light.add(spotLight1.position, 'x', -15, 15, 1).onChange(() => {
        spotLightHelper1.update();
    });
    Front_Light.add(spotLight1.position, 'y', -15, 15, 1).onChange(() => {
        spotLightHelper1.update();
    });
    Front_Light.add(spotLight1.position, 'z', -15, 15, 1).onChange(() => {
        spotLightHelper1.update();
    });

    const lightHelperControl2 = { showHelpers: false };
    const Back_Light = gui.addFolder("back Light").close();
    Back_Light.add(lightHelperControl2, "showHelpers").name("Show Front Light Helpers").onChange((value) => {
        if (value) {
            scene.add(spotLightHelper2); // Add back light helper to the scene
        } else {
            scene.remove(spotLightHelper2); // Remove back light helper from the scene
        }
    });
    Back_Light.add(backLight.position, 'x', -15, 15, 1).onChange(() => {
        spotLightHelper2.update();
    });
    Back_Light.add(backLight.position, 'y', -15, 15, 1).onChange(() => {
        spotLightHelper2.update();
    });
    Back_Light.add(backLight.position, 'z', -15, 15, 1).onChange(() => {
        spotLightHelper2.update();
    });
//
    //const loader = new GLTFLoader(loadingManager);
    
    const loadModel = (file) => {
        // Change label to "Loading..."
        document.getElementById('loading-label').innerText = 'Loading...';
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.display = 'block'; // Show loading bar
        progressBar.value = 0; // Reset progress bar value

// if 判斷 .glb 和 .gltf  用黎攞取副檔名 
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const loader = new GLTFLoader(loadingManager);

// 依個係OBJLoader 和 mtlloader (mtl同obj 是一齊用的)
        const mtlloader = new MTLLoader(loadingManager);
// 只有OBJLoader是不會見到material 的 所以通常.obj 會連住一個.mtl的檔案
        const objloader = new OBJLoader(loadingManager);

// 依個係FBXLoader
        const fbxloader = new FBXLoader(loadingManager);

// if 判斷 .glb 和 .gltf 開始
        if (fileExtension === 'glb') {
        loader.load(
            URL.createObjectURL(file),
            (gltf) => {
                if (input_model) {
                    scene.remove(input_model); // Remove the existing model if there is one
                }

                input_model = gltf.scene.children[0];
                input_model.position.set(0, -1.3, 0);
                input_model.rotation.x = Math.PI / -3;
                scene.add(gltf.scene);

                // Create a folder for Position Control in the GUI
const positionControl = gui.addFolder("Position Control").close();

// Create an object to hold the position values
const positionControlValues = {
    posX: input_model.position.x,
    posY: input_model.position.y,
    posZ: input_model.position.z
};

// Add controls for x, y, and z positions
const posXControl = positionControl.add(positionControlValues, 'posX', -100, 100, 0.1).name('Position X');
const posYControl = positionControl.add(positionControlValues, 'posY', -100, 100, 0.1).name('Position Y');
const posZControl = positionControl.add(positionControlValues, 'posZ', -100, 100, 0.1).name('Position Z');

// Update the model's position when the GUI controls change
posXControl.onChange((value) => {
    input_model.position.x = value;
});

posYControl.onChange((value) => {
    input_model.position.y = value;
});

posZControl.onChange((value) => {
    input_model.position.z = value;
});

// Optionally, you can add a reset position button
positionControl.add({
    resetPosition: () => {
        input_model.position.set(0, -1.3, 0); // Reset to initial position
        positionControlValues.posX = input_model.position.x; // Update GUI control
        positionControlValues.posY = input_model.position.y; // Update GUI control
        positionControlValues.posZ = input_model.position.z; // Update GUI control
        posXControl.updateDisplay(); // Update the GUI display
        posYControl.updateDisplay(); // Update the GUI display
        posZControl.updateDisplay(); // Update the GUI display
        console.log("Position reset to default:", input_model.position);
    }
}, 'resetPosition').name('Reset Position');

                // Get the default scale of the model
                defaultScale = input_model.scale.clone();

                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z
                };

        const Scale_control = gui.addFolder("Scale Control").close();

        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleXControl.updateDisplay(); // Update the GUI display
        });

        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleYControl.updateDisplay(); // Update the GUI display
        });
    
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleZControl.updateDisplay(); // Update the GUI display
        });

        Scale_control.add({ resetScale: () => {
            input_model.scale.copy(defaultScale); // Reset the model scale to default
            scaleXControl.setValue(defaultScale.x); // Update GUI control
            scaleXControl.updateDisplay(); // Update the GUI display
            scaleYControl.setValue(defaultScale.y); // Update GUI control
            scaleYControl.updateDisplay(); // Update the GUI display
            scaleZControl.setValue(defaultScale.z); // Update GUI control
            scaleZControl.updateDisplay(); // Update the GUI display
            console.log("Scale reset to default:", defaultScale);
        }}, 'resetScale').name('Reset Scale');

        // Show the GUI
        gui.domElement.style.display = 'block';            
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
            
        );
    } else if (fileExtension === 'gltf') {
        loader.setMeshoptDecoder(MeshoptDecoder);

        // Create a file reader to handle the GLTF file
        const reader = new FileReader();
        reader.onload = function(e){
            const arrayBuffer = e.target.result;

            // Create a blob URL from the file
            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(blob);
        

        loader.load(
            // URL.createObjectURL(file),
            blobUrl,
            (gltf) => {
                if (input_model) {
                    scene.remove(input_model); // Remove the existing model if there is one
                }

                input_model = gltf.scene.children[0];
                input_model.position.set(0, -1.3, 0);
                input_model.rotation.x = Math.PI / -3;
                scene.add(gltf.scene);

                // Get the default scale of the model
                defaultScale = input_model.scale.clone();

                // Scale control parameters
                scaleControl = {
                    scaleX: defaultScale.x,
                    scaleY: defaultScale.y,
                    scaleZ: defaultScale.z
                };

        const Scale_control = gui.addFolder("Scale Control").close();

        // Add GUI controls for scaling
        const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
        const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
        const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

        scaleXControl.onChange((value) => {
            input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
            scaleXControl.updateDisplay(); // Update the GUI display
        });

        scaleYControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
            scaleYControl.updateDisplay(); // Update the GUI display
        });
    
        scaleZControl.onChange((value) => {
            input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
            scaleZControl.updateDisplay(); // Update the GUI display
        });

        Scale_control.add({ resetScale: () => {
            input_model.scale.copy(defaultScale); // Reset the model scale to default
            scaleXControl.setValue(defaultScale.x); // Update GUI control
            scaleXControl.updateDisplay(); // Update the GUI display
            scaleYControl.setValue(defaultScale.y); // Update GUI control
            scaleYControl.updateDisplay(); // Update the GUI display
            scaleZControl.setValue(defaultScale.z); // Update GUI control
            scaleZControl.updateDisplay(); // Update the GUI display
            console.log("Scale reset to default:", defaultScale);
        }}, 'resetScale').name('Reset Scale');

        // Show the GUI
        gui.domElement.style.display = 'block';            
            },
            (xhr) => {
                const progressBar = document.getElementById('progress-bar');
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    progressBar.value = percentComplete;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
            }
            
        );
    };    
    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
} else if (fileExtension === 'obj') {

    // mtlloader.load( URL.createObjectURL(file), (mtl) => {
    const textureLoader = new THREE.TextureLoader();
    const objtexture = textureLoader.load('./storm-trooper-a-pose/source/Storm Trooper OBJ/textures/image_0.jpg');
    // const objtexture = textureLoader.load('./stormtrooper-obj/textures/Stormtrooper_D.png');
    // const objtexture = textureLoader.load('./stormtrooper-obj/textures/Image_0.jpeg');
    // Load the additional texture (e.g., specular or normal map)
    // const specularTexture = textureLoader.load('./stormtrooper-obj/textures/Stormtrooper_S.png');
    // const specularTexture = textureLoader.load('./stormtrooper-obj/textures/Stormtrooper_S.png');
    
// 沒有mtlloader
    mtlloader.load( './storm-trooper-a-pose/source/Storm Trooper OBJ/output.mtl', (mtl) => {
        mtl.preload();
        objloader.setMaterials(mtl);
// 沒有mtlloader
    objloader.load(
        URL.createObjectURL(file),
        (obj) => {
            if (input_model) {
                scene.remove(input_model); // Remove the existing model if there is one
            }
            obj.traverse(node => {
                if(node.isMesh) {
                    node.material.map = objtexture;

                    // If you want to use the additional texture as a specular map
                    // node.material.specularMap = specularTexture;
                }
            })

            // input_model = obj.scene.children[0];
            input_model = obj;
            obj.position.set(0, -1.3, 0);
            // obj.rotation.x = Math.PI / -3;
            // input_model.position.set(0, -1.3, 0);
            // input_model.rotation.x = Math.PI / -3;
            scene.add(obj);

            // Get the default scale of the model
            defaultScale = input_model.scale.clone();

            // Scale control parameters
            scaleControl = {
                scaleX: defaultScale.x,
                scaleY: defaultScale.y,
                scaleZ: defaultScale.z
            };

    const Scale_control = gui.addFolder("Scale Control").close();

    // Add GUI controls for scaling
    const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
    const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
    const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

    scaleXControl.onChange((value) => {
        input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
        scaleXControl.updateDisplay(); // Update the GUI display
    });

    scaleYControl.onChange((value) => {
        input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
        scaleYControl.updateDisplay(); // Update the GUI display
    });

    scaleZControl.onChange((value) => {
        input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
        scaleZControl.updateDisplay(); // Update the GUI display
    });

    Scale_control.add({ resetScale: () => {
        input_model.scale.copy(defaultScale); // Reset the model scale to default
        scaleXControl.setValue(defaultScale.x); // Update GUI control
        scaleXControl.updateDisplay(); // Update the GUI display
        scaleYControl.setValue(defaultScale.y); // Update GUI control
        scaleYControl.updateDisplay(); // Update the GUI display
        scaleZControl.setValue(defaultScale.z); // Update GUI control
        scaleZControl.updateDisplay(); // Update the GUI display
        console.log("Scale reset to default:", defaultScale);
    }}, 'resetScale').name('Reset Scale');

    // // Show the GUI
    gui.domElement.style.display = 'block'; 
// 因為要test objloader 所以將上面的code註解           
        },
        (xhr) => {
            const progressBar = document.getElementById('progress-bar');
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                progressBar.value = percentComplete;
            }
        },
        (error) => {
            console.error('Error loading model:', error);
        }
        
    );
// 沒有mtlloader
});
// 沒有mtlloader
}else if (fileExtension === 'fbx'){
    fbxloader.load(
        URL.createObjectURL(file),
        (fbx) => {
            if (input_model) {
                scene.remove(input_model); // Remove the existing model if there is one
            }

            // input_model = fbx.scene.children[0];
            input_model = fbx;
            // input_model.position.set(0, -1.3, 0);
            // input_model.rotation.x = Math.PI / -3;
            scene.add(fbx);

            // Get the default scale of the model
            defaultScale = input_model.scale.clone();

            // Scale control parameters
            scaleControl = {
                scaleX: defaultScale.x,
                scaleY: defaultScale.y,
                scaleZ: defaultScale.z
            };

    const Scale_control = gui.addFolder("Scale Control").close();

    // Add GUI controls for scaling
    const scaleXControl = Scale_control.add(scaleControl, 'scaleX', 0.001, 3).name(`Scale X`);
    const scaleYControl = Scale_control.add(scaleControl, 'scaleY', 0.001, 3).name('Scale Y');
    const scaleZControl = Scale_control.add(scaleControl, 'scaleZ', 0.001, 3).name('Scale Z');

    scaleXControl.onChange((value) => {
        input_model.scale.set(value, input_model.scale.y, input_model.scale.z);
        scaleXControl.updateDisplay(); // Update the GUI display
    });

    scaleYControl.onChange((value) => {
        input_model.scale.set(input_model.scale.x, value, input_model.scale.z);
        scaleYControl.updateDisplay(); // Update the GUI display
    });

    scaleZControl.onChange((value) => {
        input_model.scale.set(input_model.scale.x, input_model.scale.y, value);
        scaleZControl.updateDisplay(); // Update the GUI display
    });

    Scale_control.add({ resetScale: () => {
        input_model.scale.copy(defaultScale); // Reset the model scale to default
        scaleXControl.setValue(defaultScale.x); // Update GUI control
        scaleXControl.updateDisplay(); // Update the GUI display
        scaleYControl.setValue(defaultScale.y); // Update GUI control
        scaleYControl.updateDisplay(); // Update the GUI display
        scaleZControl.setValue(defaultScale.z); // Update GUI control
        scaleZControl.updateDisplay(); // Update the GUI display
        console.log("Scale reset to default:", defaultScale);
    }}, 'resetScale').name('Reset Scale');

    // Show the GUI
    gui.domElement.style.display = 'block';            
        },
        (xhr) => {
            const progressBar = document.getElementById('progress-bar');
            if (xhr.lengthComputable) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                progressBar.value = percentComplete;
            }
        },
        (error) => {
            console.error('Error loading model:', error);
        }
        
    );
}
else {
        console.error('Unsupported file format:', fileExtension);
    }

// if 判斷 .glb 和 .gltf 完結   
    };



    // Button and file input handling
    const loadModelBtn = document.getElementById('myButton');
    const modelFileInput = document.getElementById('model-file-input');

    loadModelBtn.addEventListener('click', () => {
        modelFileInput.click(); // Trigger the file input when the button is clicked
    });

    modelFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadModel(file);
        }
        // for(const file of event.target.files){
        //     loadModel(file);
        // }
    });
//

    const autoRotate = { rotate: false };
    const Auto_Rotate = gui.addFolder("Auto Rotate").close();
    Auto_Rotate.add(autoRotate, "rotate").name("Auto Rotate").onChange((value) => {
        controls.autoRotate = value; // Enable or disable auto-rotation based on checkbox
    });

     // Add a control for auto-rotate speed
     const speedControl = { speed: controls.autoRotateSpeed };
     Auto_Rotate.add(speedControl, "speed", 0, 20).name("Auto Rotate Speed").onChange((value) => {
         controls.autoRotateSpeed = value; // Update the auto-rotate speed
     });

    // Start animation loop
    animate();
}

// function 集中地


// let step = 0;

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    // step += 0.02;
    // input_model.position.y = 2*Math.abs(Math.sin(step));
    // console.log(Math.abs(Math.sin(step)));
    controls.update(); // Update controls to apply autorotation if enabled
    renderer.render(scene, camera);
    stats.update();  // Update stats only if visible
}

const updateCamera = () => {
    camera.updateProjectionMatrix();
}
// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    updateCamera(); // camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.onload = init;