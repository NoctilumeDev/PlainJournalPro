# PlainJournalPro

[![Repository gates](https://github.com/NoctilumeDev/PlainJournalPro/actions/workflows/repository-gates.yml/badge.svg)](https://github.com/NoctilumeDev/PlainJournalPro/actions/workflows/repository-gates.yml)
[![Status](https://img.shields.io/badge/status-planned%20%2F%20design--only-6f624b)](#当前状态)
[![License](https://img.shields.io/badge/license-Apache--2.0-4f7668)](./LICENSE)

> 素简记 M9+ 多商户平台演进项目。

[PlainJournal](https://github.com/NoctilumeDev/PlainJournal) 已完成 M0-M8 自营 B2C
业务闭环，并作为冻结的参考基线。PlainJournalPro 在不污染该基线的前提下，重新设计
多商户所有权、订单、履约、售后和资金模型。

## 当前状态

**规划与参考架构阶段，尚未进入生产实现。**

本仓库目前不包含 PlainJournal 的源码或 Git 历史，也不把路线图描述成已经完成的能力。
后续代码、测试证据、Issue、Release 和版本历史均独立维护。

## 研究范围

PlainJournalPro 从 M9 开始，重点研究：

- Merchant、Shop、商户子账号与经营主体所有权；
- 跨店购物车、父订单、店铺子订单与独立履约责任；
- 平台优惠、店铺优惠、补贴与资金承担方分摊；
- 平台账本、手续费、佣金、商户结算与逆向冲正；
- 店铺级发货、售后、退货仓与跨商户权限隔离；
- 多实例竞争、消息恢复、对账、补偿与容量边界；
- Java 交易核心与职责明确的 Go 服务协作。

## 架构原则

1. **先重建领域边界，再决定服务边界。** 不在原模型中机械追加 `merchant_id`。
2. **最终事实必须有唯一所有者。** 缓存、搜索和聚合投影不能替代权威账本。
3. **交易与资金分别建模。** 订单状态、支付状态、平台账本和商户结算不可混为一体。
4. **本地事务保存业务事实。** 跨服务通过 Outbox、幂等消费、补偿和对账收敛。
5. **Go 必须承担独立职责。** 不为展示异构技术而重写已经适合 Java 的领域服务。
6. **容量结论必须附带边界。** 记录硬件、拓扑、数据规模、并发模型和停止条件。

Go 的候选职责包括实时连接路由、事件聚合、平台账本流水处理或商户结算批处理。最终
选择由数据所有权、吞吐特征和失败边界决定。

## 与 PlainJournal 的关系

| 维度 | PlainJournal | PlainJournalPro |
| --- | --- | --- |
| 业务范围 | M0-M8 单经营主体、自营 B2C | M9+ 多商户平台 |
| 当前状态 | 已完成并冻结的参考基线 | 规划与参考架构阶段 |
| 资金模型 | 顾客与自营平台交易 | 平台、商户、手续费、佣金与结算 |
| 技术角色 | Java/Spring 为主的已验证系统 | Java 交易核心与有职责的 Go 服务 |
| Git 策略 | 保留稳定基线和缺陷修复历史 | 独立建仓、独立演进 |

PlainJournal 是控制组，不是等待 Pro 补齐的残缺版本；PlainJournalPro 是新课题，不是
换名后的源码副本。

## 实验边界

计划在 32GB 单机环境中进行缩比实验。该环境用于验证问题类型、业务不变量和故障恢复，
不构成生产容量声明。

验证仍遵循控制变量法：

```text
单变量串行
  -> 代表业务组合
  -> 确定性高风险场景
  -> 保存种子的随机扰动
  -> 资源边界内的全链路验收
```

并发数字必须区分虚拟用户、同时在途请求、请求总数、RPS 和热点竞争数；任何测试都要
同时核对库存、订单、支付、账本、结算、消息和补偿事实。

## 下一步

1. 明确 Merchant、Shop、Platform Ledger 与 Settlement 的数据所有权。
2. 建立父子订单、分摊、结算和逆向冲正状态机。
3. 通过 ADR 决定 Java/Go 边界与服务拓扑。
4. 建立最小可运行链路后，再引入中间件和容量实验。
5. 形成可重复的测试、文档、CI、安全与发布证据。

## License

[Apache License 2.0](LICENSE)
