import { IsInt, IsString, Max, Min } from 'class-validator'

export class StartDto {
  @IsInt()
  @Min(1)
  @Max(10000)
  inputNum: number

  @IsString()
  inputText: string
}
