import * as THREE from 'three'
import { extend } from '@react-three/fiber'

class MeshSineMaterial extends THREE.MeshBasicMaterial {
  constructor(parameters = {}) {
    super(parameters)
    this.setValues(parameters)
    this.time = { value: 0 }
  }
  onBeforeCompile(shader) {
    shader.uniforms.time = this.time
    shader.vertexShader = `
      uniform float time;
      ${shader.vertexShader}
    `
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = vec3(position.x, position.y + sin(time + uv.x * PI * 4.0) / 4.0, position.z);`
    )
  }
}

// BentPlaneGeometryは不要になったため、extendから削除します
extend({ MeshSineMaterial })