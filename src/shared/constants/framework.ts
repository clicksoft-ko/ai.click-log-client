// 프레임워크와 흔한 서드파티 라이브러리. 여기에 해당하지 않으면 우리 코드로 본다
export const FRAMEWORK_PATTERN =
  /^(System|Microsoft|MS\.Internal|mscorlib|Mono|FarPoint|DevExpress|DevComponents|GrapeCity|Newtonsoft|Npgsql|MySql|Oracle|log4net|NLog|Telerik|Infragistics|C1|Dapper|Castle|Autofac)\./;

/** "네임스페이스.클래스.메서드" 또는 "어셈블리.클래스" 형태의 이름이 우리 코드인지 */
export const isAppCode = (qualifiedName: string) =>
  !FRAMEWORK_PATTERN.test(qualifiedName);
