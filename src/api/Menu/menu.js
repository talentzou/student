import request from "@/utils/axios"
// 登录
export const GetMenuResponse = (id) => {
  return request({
    method: "get",
    url: `/base/sys_jwt/getMenu/${id}`,
  })
}

export const GetSelfMenu = () => {
  return request({
    method: "get",
    url: "/base/sys_jwt/menu/getSelfMenu"
  })
}