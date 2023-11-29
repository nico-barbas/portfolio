import { Quaternion } from "three";
import { Vector3 } from "three";

/**
 * @param {Vector3} v
 */
export function vector3Orthogonal(v) {
  const x = Math.abs(v.x);
  const y = Math.abs(v.y);
  const z = Math.abs(v.z);

  let other = new Vector3();
  if (x < y) {
    if (x < z) {
      other.set(1, 0, 0);
    } else {
      other.set(0, 0, 1);
    }
  } else {
    if (y < z) {
      other.set(0, 1, 0);
    } else {
      other.set(0, 0, 1);
    }
  }

  const c = v.clone();
  const result = c.cross(other).normalize();
  return result;
}

/**
 * @param {Vector3} from
 * @param {Vector3} to
 */
export function quaternionFromToRotation(from, to) {
  const result = new Quaternion();

  const x = from.clone().normalize();
  const y = to.clone().normalize();

  const cosTheta = x.dot(y);

  const eps = 1e-7;
  if (Math.abs(cosTheta + 1) < 2 * eps) {
    const v = vector3Orthogonal(x);
    result.x = v.x;
    result.y = v.y;
    result.z = v.z;
    result.w = 0;
    return result.normalize();
  }

  const v = x.cross(y);
  result.w = cosTheta + 1;
  result.x = v.x;
  result.y = v.y;
  result.z = v.z;
  return result.normalize();
}
