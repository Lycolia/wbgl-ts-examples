import {
  create,
  identity,
  lookAt,
  perspective,
  multiply,
} from '../../libs/minMatrix';
import { fragment, vertex } from './shader';

/**
 * VBOオブジェクト
 */
export type VertexBufferObject = {
  location: number;
  length: number;
  vertex: number[];
  vbo: WebGLBuffer | null;
};

/**
 * VBOオブジェクトの作成
 */
export const createVBOObject = (): VertexBufferObject => {
  return {
    location: 0,
    length: 0,
    vertex: [],
    vbo: null,
  };
};

/**
 * canvasへ描画
 * @param canvas
 */
export const renderGL = (canvas: HTMLCanvasElement) => {
  canvas = SetupClientRect(canvas);
  let glCtx = GetGLContext(canvas);
  if (!glCtx) return;
  glCtx = SetupGLContext(glCtx);
  const program = createShaderProgram(glCtx);
  if (!program) return;
  generateVBO(glCtx, program);
  drawPolygon(glCtx, program);
};

/**
 * クライアント領域を設定
 * @param canvas
 */
export const SetupClientRect = (canvas: HTMLCanvasElement) => {
  canvas.width = 1024;
  canvas.height = 768;
  return canvas;
};

/**
 * WebGLRenderingContextの取得
 * @param canvas
 */
export const GetGLContext = (canvas: HTMLCanvasElement) => {
  return canvas.getContext('webgl');
};

/**
 * WebGLRenderingContextの初期化
 * @param glCtx
 */
export const SetupGLContext = (glCtx: WebGLRenderingContext) => {
  // クリア色設定
  glCtx.clearColor(0.0, 0.0, 0.0, 1.0);
  // クリア深度設定
  glCtx.clearDepth(1.0);
  // 色設定と深度設定を元にキャンバスを初期化
  glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);
  return glCtx;
};

/**
 * シェーダープログラムを作成
 * @param glCtx
 */
export const createShaderProgram = (glCtx: WebGLRenderingContext) => {
  // シェーダープログラムの作成
  const program = glCtx.createProgram();
  if (!program) return;
  const vshader = createVertexShader(glCtx);
  if (!vshader) return;
  const fshader = createFragmentShader(glCtx);
  if (!fshader) return;
  // シェーダープログラムに頂点シェーダーを添付
  glCtx.attachShader(program, vshader);
  // シェーダープログラムにフラグメントシェーダーを添付
  glCtx.attachShader(program, fshader);
  // 添付したシェーダーをリンク
  glCtx.linkProgram(program);
  if (glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
    // コケてなければ
    // このシェーダープログラムを使う
    glCtx.useProgram(program);

    return program;
  } else {
    console.error(glCtx.getProgramInfoLog(program));
  }
};

/**
 * 頂点シェーダーの作成
 * @param glCtx
 */
export const createVertexShader = (glCtx: WebGLRenderingContext) => {
  // 頂点シェーダーを作成
  const shader = glCtx.createShader(glCtx.VERTEX_SHADER);
  if (!shader) return;
  // 作成したシェーダーにスクリプトを紐付け
  glCtx.shaderSource(shader, vertex);
  // コンパイル
  glCtx.compileShader(shader);

  // エラーハンドリング
  if (glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
    return shader;
  } else {
    console.error(glCtx.getShaderInfoLog(shader));
  }
};

/**
 * フラグメントシェーダーの作成
 * @param glCtx
 */
export const createFragmentShader = (glCtx: WebGLRenderingContext) => {
  // 頂点シェーダーを作成
  const shader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
  if (!shader) return;
  // 作成したシェーダーにスクリプトを紐付け
  glCtx.shaderSource(shader, fragment);
  // コンパイル
  glCtx.compileShader(shader);

  // エラーハンドリング
  if (glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
    return shader;
  } else {
    console.error(glCtx.getShaderInfoLog(shader));
  }
};

/**
 * バッファを取得
 */
export const getBuffer = (glCtx: WebGLRenderingContext, srcArr: number[]) => {
  // バッファの作成
  const vboBuff = glCtx.createBuffer();
  // バッファのバインド
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vboBuff);
  // バッファにデータを流し込む
  glCtx.bufferData(
    glCtx.ARRAY_BUFFER,
    new Float32Array(srcArr),
    glCtx.STATIC_DRAW
  );
  // バッファのバインドを切る
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);
  return vboBuff;
};

/**
 * VBOの生成
 * @param glCtx
 * @param program
 */
export const generateVBO = (
  glCtx: WebGLRenderingContext,
  program: WebGLProgram
) => {
  const position = createVBOObject();
  const color = createVBOObject();
  // shaderで定義したattaributeのポインタを取得する
  position.location = glCtx.getAttribLocation(program, 'position');
  color.location = glCtx.getAttribLocation(program, 'color');
  // attaributeの要素数を設定
  position.length = 3;
  color.length = 4;
  // 頂点座標情報
  position.vertex = [
    // Top
    0.0, // X
    2.0, // Y
    0.0, // Z
    // Right
    1.5, // X
    0.0, // Y
    0.0, // Z
    // Left
    -0.5, // X
    0.0, // Y
    0.0, // Z
  ];
  color.vertex = [
    // Top
    1.0, // R
    0.1, // G
    0.0, // B
    1.0, // A
    // Right
    0.0, // R
    1.0, // G
    0.0, // B
    1.0, // A
    // Left
    0.0, // R
    0.0, // G
    1.0, // B
    1.0, // A
  ];

  // 頂点バッファの取得
  const posBuff = getBuffer(glCtx, position.vertex);
  if (!posBuff) return;
  position.vbo = posBuff;
  const colorBuff = getBuffer(glCtx, color.vertex);
  if (!colorBuff) return;
  color.vbo = colorBuff;
  // VBOをバインド
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, position.vbo);
  // attrをバッファに格納みたいなふるまい？
  glCtx.enableVertexAttribArray(position.location);
  // シェーダーに登録してるらしい。バインドしたVBOに対して実行される？
  glCtx.vertexAttribPointer(
    position.location,
    position.length,
    glCtx.FLOAT,
    false,
    0,
    0
  );
  // VBOをバインド
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, color.vbo);
  // attrをバッファに格納みたいなふるまいか？
  glCtx.enableVertexAttribArray(color.location);
  // シェーダーに登録してるらしい。バインドしたVBOに対して実行される？
  glCtx.vertexAttribPointer(
    color.location,
    color.length,
    glCtx.FLOAT,
    false,
    0,
    0
  );
};

/**
 * ポリゴンを描画
 * @param glCtx
 * @param program
 */
export const drawPolygon = (
  glCtx: WebGLRenderingContext,
  program: WebGLProgram
) => {
  // 行列の生成
  const model = identity(create()); // モデル情報（モデルの位置、回転、縮尺
  const view = identity(create()); // ビュー情報（視点の位置、注視点、向き
  const projection = identity(create()); // プロジェクション情報（スクリーンのサイズ、クリッピング領域
  const mvpMatrix = identity(create()); // 足し込みバッファ

  const eye = new Float32Array([0.0, 1.0, 3.0]);
  const center = new Float32Array([0.0, 0.0, 0.0]);
  const up = new Float32Array([0.0, 1.0, 0.0]);
  console.log(111);
  // ビュー変換
  lookAt(eye, center, up, view);
  // プロジェクション変換
  perspective(90, 1024 / 768, 0.1, 100, projection);

  multiply(projection, view, mvpMatrix); // プロジェクション * ビュー = 足し込みバッファ
  multiply(mvpMatrix, model, mvpMatrix); // 足し込みバッファ * モデル = 足し込みバッファ

  // shaderで定義したuniformのポインタを取得する
  const uniLocation = glCtx.getUniformLocation(program, 'mvpMatrix');
  // uniformのポインタをバッファに格納している？
  glCtx.uniformMatrix4fv(uniLocation, false, mvpMatrix);
  // ここまでの情報を元にバッファ内にモデルを描画？
  glCtx.drawArrays(glCtx.TRIANGLES, 0, 3);
  // ここまでのバッファデータを吐く
  glCtx.flush();
};
